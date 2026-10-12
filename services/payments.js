import "server-only";
import mongoose from "mongoose";
import { shopData } from "@/data/shopData";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { Order } from "@/lib/db/models";
import { isMethodEnabled, isOnlineMethod, siteUrl } from "@/lib/payments/config";
import { createBkashPayment, executeBkashPayment } from "@/lib/payments/bkash";
import { createNagadPayment, verifyNagadPayment } from "@/lib/payments/nagad";
import { sendMail } from "@/lib/server/mailer";
import { paymentEmail } from "@/lib/server/emailTemplates";

/**
 * Online payments for medicine orders (bKash / Nagad).
 * ─────────────────────────────────────────────────────────────────
 * start   → reserve an attempt number atomically, create the gateway session,
 *           store it in payment.sessions, return the gateway URL.
 * settle  → after the callback, ask the GATEWAY for the final state (never trust the
 *           query string), check the amount, then mark paid with a conditional update
 *           ({ status ≠ paid }) — double callbacks / refreshes are harmless.
 * ─────────────────────────────────────────────────────────────────
 */

const trusted = mongoose.trusted;
const OPEN_ORDER = ["new", "processing", "dispatched"];
const MAX_ATTEMPTS = 10;
const methodLabel = (m) => shopData.payment.methods[m]?.label ?? m;

/** Can the customer (still) pay this order online? */
export const canPayOnline = (o) =>
  OPEN_ORDER.includes(o?.status) && o?.payment?.status !== "paid" && o?.payment?.status !== "review" && (o?.payment?.amount ?? 0) > 0;

/**
 * Begin (or retry) an online payment.
 * @returns {{ ok: true, redirectUrl } | { ok: false, code: "disabled"|"notFound"|"closed"|"tooMany"|"gateway" }}
 */
export async function startPayment({ reference, method, ip }) {
  if (!isOnlineMethod(method) || !isMethodEnabled(method)) return { ok: false, code: "disabled" };
  await connectDB();

  // Reserve the attempt number first → every gateway call gets a unique invoice / order id
  const order = await Order.findOneAndUpdate(
    {
      reference,
      status: trusted({ $in: OPEN_ORDER }),
      "payment.status": trusted({ $nin: ["paid", "review"] }),
      "payment.amount": trusted({ $gt: 0 }),
      "payment.attempts": trusted({ $lt: MAX_ATTEMPTS }),
    },
    { $set: { "payment.method": method, "payment.status": "pending" }, $inc: { "payment.attempts": 1 } },
    { returnDocument: "after", projection: { reference: 1, status: 1, payment: 1, "customer.phone": 1 } }
  ).lean();

  if (!order) {
    const exists = await Order.findOne({ reference }).select("status payment.status payment.attempts").lean();
    if (!exists) return { ok: false, code: "notFound" };
    return { ok: false, code: (exists.payment?.attempts ?? 0) >= MAX_ATTEMPTS ? "tooMany" : "closed" };
  }

  const attempt = order.payment.attempts;
  const amount = order.payment.amount;
  try {
    let session;
    if (method === "bkash") {
      const invoice = `${order.reference}-${attempt}`;
      const r = await createBkashPayment({
        amount,
        invoice,
        payerReference: order.customer?.phone ?? order.reference,
        callbackURL: siteUrl("/api/payment/bkash/callback"),
      });
      session = { method, gatewayRef: r.gatewayRef, gatewayOrderId: invoice, redirectUrl: r.redirectUrl };
    } else {
      const orderId = `${order.reference.replaceAll("-", "")}${attempt}`; // alphanumeric, ≤ 20 chars
      const r = await createNagadPayment({ amount, orderId, ip, callbackURL: siteUrl("/api/payment/nagad/callback") });
      session = { method, gatewayRef: r.gatewayRef, gatewayOrderId: orderId, redirectUrl: r.redirectUrl };
    }

    await Order.updateOne(
      { _id: order._id },
      {
        $push: {
          "payment.sessions": {
            $each: [{ method, gatewayRef: session.gatewayRef, gatewayOrderId: session.gatewayOrderId, at: new Date() }],
            $slice: -MAX_ATTEMPTS,
          },
        },
        $unset: { "payment.lastError": 1 },
      }
    );
    return { ok: true, redirectUrl: session.redirectUrl };
  } catch (err) {
    console.error(`[payment] ${method} start failed for ${reference}:`, err.message, err.details ?? "");
    await Order.updateOne(
      { _id: order._id, "payment.status": "pending" },
      { $set: { "payment.status": "failed", "payment.lastError": String(err.message).slice(0, 300) } }
    );
    return { ok: false, code: "gateway" };
  }
}

/** Shared ending for both gateways. Returns the order reference for the redirect. */
async function settle(order, session, result) {
  const due = order.payment?.amount ?? 0;

  if (result.completed && result.amount === due) {
    const res = await Order.updateOne(
      { _id: order._id, "payment.status": trusted({ $ne: "paid" }) },
      {
        $set: {
          "payment.status": "paid",
          "payment.method": session.method,
          "payment.trxId": result.trxId ? String(result.trxId).slice(0, 80) : undefined,
          "payment.payer": result.payer ? String(result.payer).slice(0, 20) : undefined,
          "payment.paidAt": new Date(),
        },
        $unset: { "payment.lastError": 1 },
      }
    );
    if (res.modifiedCount) {
      await sendMail(
        paymentEmail({
          reference: order.reference,
          methodLabel: methodLabel(session.method),
          amount: due,
          trxId: result.trxId,
          adminPath: `/admin/orders/${order._id}`,
        })
      );
    }
    return "paid";
  }

  if (result.completed) {
    // Money moved but not the amount we asked for — never auto-accept, flag for staff.
    console.error(`[payment] amount mismatch on ${order.reference}: due ${due}, gateway ${result.amount}`);
    await Order.updateOne(
      { _id: order._id, "payment.status": trusted({ $ne: "paid" }) },
      {
        $set: {
          "payment.status": "review",
          "payment.method": session.method,
          "payment.trxId": result.trxId ? String(result.trxId).slice(0, 80) : undefined,
          "payment.lastError": `Amount mismatch: due ${due}, received ${result.amount}`,
        },
      }
    );
    return "review";
  }

  await Order.updateOne(
    { _id: order._id, "payment.status": trusted({ $nin: ["paid", "review"] }) },
    { $set: { "payment.status": "failed", "payment.lastError": String(result.message ?? result.status ?? "Not completed").slice(0, 300) } }
  );
  return "failed";
}

async function findBySession(gatewayRef, method) {
  if (!gatewayRef || typeof gatewayRef !== "string" || gatewayRef.length > 120) return null;
  await connectDB();
  const order = await Order.findOne({ "payment.sessions.gatewayRef": gatewayRef })
    .select("reference status payment")
    .lean();
  const session = order?.payment?.sessions?.find((s) => s.gatewayRef === gatewayRef && s.method === method);
  return session ? { order, session } : null;
}

/**
 * bKash callback: ?paymentID=&status=success|failure|cancel
 * @returns {{ reference: string|null, result: "paid"|"failed"|"cancel"|"review"|"error" }}
 */
export async function handleBkashCallback({ paymentID, status }) {
  const found = await findBySession(paymentID, "bkash");
  if (!found) return { reference: null, result: "error" };
  const { order, session } = found;
  if (order.payment.status === "paid") return { reference: order.reference, result: "paid" };

  if (status !== "success") {
    await settle(order, session, { completed: false, message: status === "cancel" ? "Cancelled by customer" : "Payment failed at bKash" });
    return { reference: order.reference, result: status === "cancel" ? "cancel" : "failed" };
  }
  try {
    const r = await executeBkashPayment(paymentID);
    if (r.invoice && r.invoice !== session.gatewayOrderId) r.completed = false; // not our invoice → never accept
    return { reference: order.reference, result: await settle(order, session, r) };
  } catch (err) {
    console.error(`[payment] bKash settle failed for ${order.reference}:`, err.message);
    return { reference: order.reference, result: "error" };
  }
}

/** Nagad callback: ?payment_ref_id=&order_id=&status= — the status is re-checked with Nagad. */
export async function handleNagadCallback({ paymentRefId, ip }) {
  const found = await findBySession(paymentRefId, "nagad");
  if (!found) return { reference: null, result: "error" };
  const { order, session } = found;
  if (order.payment.status === "paid") return { reference: order.reference, result: "paid" };
  try {
    const r = await verifyNagadPayment(paymentRefId, ip);
    if (r.orderId && r.orderId !== session.gatewayOrderId) r.completed = false;
    const outcome = await settle(order, session, r);
    const aborted = !r.completed && /abort|cancel/i.test(r.status ?? "");
    return { reference: order.reference, result: aborted ? "cancel" : outcome };
  } catch (err) {
    console.error(`[payment] Nagad settle failed for ${order.reference}:`, err.message);
    return { reference: order.reference, result: "error" };
  }
}

/** Public, PII-free view of an order's payment for the /payment page. */
export async function getPaymentView(reference) {
  if (!isDbConfigured() || !/^RX-\d{6}-[A-Z0-9]{4}$/.test(reference ?? "")) return null;
  await connectDB();
  const o = await Order.findOne({ reference }).select("reference status payment").lean();
  if (!o) return null;
  return {
    reference: o.reference,
    method: o.payment?.method ?? "offline",
    status: o.payment?.status ?? "unpaid",
    amount: o.payment?.amount ?? 0,
    trxId: o.payment?.status === "paid" ? o.payment?.trxId ?? null : null,
    cancelled: o.status === "cancelled",
    canPayOnline: canPayOnline(o) && (o.payment?.attempts ?? 0) < MAX_ATTEMPTS,
  };
}
