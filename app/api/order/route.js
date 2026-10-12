import { z } from "zod";
import { formMessages as M } from "@/data/formMessages";
import { shopData } from "@/data/shopData";
import { orderSchema } from "@/lib/validation/order";
import { canOrder, isExpired } from "@/lib/shop";
import { rateLimit } from "@/lib/server/rateLimit";
import { getClientIp, isSameOrigin, makeReference, reply, requestMeta } from "@/lib/server/request";
import { sendMail } from "@/lib/server/mailer";
import { orderEmail } from "@/lib/server/emailTemplates";
import { isMethodEnabled, isOnlineMethod } from "@/lib/payments/config";
import { getProductBySlug } from "@/services/content";
import { markNotified, saveOrder } from "@/services/submissions";
import { startPayment } from "@/services/payments";

const MAX_BODY = 16 * 1024;

/**
 * POST /api/order — JSON. No prescription upload (owner decision 2026-10-12).
 * Pipeline: origin → rate limit → size cap → honeypot → zod → product lookup (DB price,
 *           stock, expiry) → payment method enabled? → save order → email
 *           → online method: create the gateway session and return its URL.
 * The order is saved and the clinic emailed BEFORE the customer leaves for bKash / Nagad,
 * so an abandoned payment still leaves a callable order ("awaiting payment").
 */
export async function POST(request) {
  if (!isSameOrigin(request)) return reply.forbidden();

  const limit = rateLimit(`order:${getClientIp(request)}`, { limit: 6, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) return reply.limited(limit.retryAfter);

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return reply.tooLarge(M.server.invalid);

  let body;
  try {
    body = await request.json();
  } catch {
    return reply.invalid({});
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return reply.invalid({});
  if (body.company) return reply.ok({ reference: makeReference("RX") });

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) return reply.invalid(z.flattenError(parsed.error).fieldErrors);
  const o = parsed.data;

  // Product must exist, be active, in stock and not expired — price comes from the catalogue, never the client
  const product = await getProductBySlug(o.product);
  if (!product || !canOrder(product)) {
    return reply.invalid({ product: [product && isExpired(product) ? M.expired : M.product] });
  }
  if (!isMethodEnabled(o.paymentMethod)) return reply.invalid({ paymentMethod: [M.paymentUnavailable] });

  let record = null;
  try {
    record = await saveOrder(o, { product, meta: requestMeta(request) });
  } catch (err) {
    console.error("[order] save failed:", err?.message);
    // Online payment needs the stored order; pay-later can still go out by email
    if (isOnlineMethod(o.paymentMethod)) return reply.failed();
  }

  const reference = record?.reference ?? makeReference("RX");
  const amount = product.price * o.quantity;
  const method = shopData.payment.methods[o.paymentMethod];

  const sent = await sendMail(
    orderEmail({
      ...o,
      reference,
      amount,
      productLabel: product.name,
      paymentLabel: isOnlineMethod(o.paymentMethod) ? `${method.label} — awaiting online payment` : method.label,
      adminPath: record ? `/admin/orders/${record.id}` : null,
    })
  );
  await markNotified(record, sent);
  if (!sent && !record) return reply.failed();

  if (!isOnlineMethod(o.paymentMethod)) return reply.ok({ reference });

  const pay = await startPayment({ reference, method: o.paymentMethod, ip: getClientIp(request) });
  // Gateway down → the order still stands; the customer can retry from /payment or pay later
  return reply.ok(pay.ok ? { reference, redirectUrl: pay.redirectUrl } : { reference, paymentFailed: true });
}
