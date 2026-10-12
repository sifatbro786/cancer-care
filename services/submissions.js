import "server-only";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { Appointment, Message, Order } from "@/lib/db/models";
import { makeReference } from "@/lib/server/request";

/**
 * Write side for the public forms (appointment, order, contact).
 * ─────────────────────────────────────────────────────────────────
 * Contract with the Route Handlers:
 *   - DB configured     → the record is saved FIRST; email is a side-effect.
 *                         A save failure throws; the handler degrades to email-only
 *                         and answers 502 only if the email fails as well.
 *   - DB not configured → returns null; the handler falls back to email-only
 *                         (static-demo behaviour from Phase 4).
 * ─────────────────────────────────────────────────────────────────
 */

const DUPLICATE_KEY = 11000;

/** Insert with a fresh reference; retry on the (very rare) reference collision. */
async function createWithReference(Model, prefix, data) {
  await connectDB();
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const doc = await Model.create({ ...data, reference: makeReference(prefix) });
      return { model: Model, id: doc._id, reference: doc.reference };
    } catch (err) {
      const refClash = err?.code === DUPLICATE_KEY && err?.keyPattern?.reference;
      if (!refClash) throw err;
    }
  }
  throw new Error(`[submissions] could not allocate a unique ${prefix} reference`);
}

/** Record whether the clinic email went out — the admin inbox flags records that were never emailed. */
export async function markNotified(record, sent) {
  if (!record) return;
  try {
    await record.model.updateOne(
      { _id: record.id },
      { $set: { "notification.clinicEmailed": Boolean(sent), ...(sent ? { "notification.emailedAt": new Date() } : {}) } }
    );
  } catch (err) {
    console.error("[submissions] markNotified failed:", err?.message); // never fails the request
  }
}

export async function saveAppointment(a, { service, meta }) {
  if (!isDbConfigured()) return null;
  return createWithReference(Appointment, "CC", {
    type: a.type,
    service: service ? { slug: service.slug, title: service.title } : undefined,
    date: a.date,
    slot: a.slot,
    startsAt: new Date(`${a.date}T${a.slot}:00+06:00`), // schedule is Asia/Dhaka wall time
    patient: { name: a.name, phone: a.phone, email: a.email, age: a.age },
    visit: a.visit,
    message: a.message || undefined,
    consentAt: new Date(),
    meta,
  });
}

export async function saveOrder(o, { product, meta }) {
  if (!isDbConfigured()) return null;
  const item = {
    product: product.id,
    slug: product.slug,
    name: product.name,
    unitPrice: product.price, // server-side price — the client never sends money
    quantity: o.quantity,
    coldChain: Boolean(product.coldChain),
  };
  const subtotal = item.unitPrice * item.quantity;

  return createWithReference(Order, "RX", {
    items: [item],
    subtotal,
    customer: { name: o.name, phone: o.phone, address: o.address },
    note: o.note || undefined,
    payment: { method: o.paymentMethod, status: "unpaid", amount: subtotal },
    meta,
  });
}

export async function saveMessage(c, { meta }) {
  if (!isDbConfigured()) return null;
  return createWithReference(Message, "MSG", {
    name: c.name,
    phone: c.phone,
    email: c.email,
    subject: c.subject,
    message: c.message,
    meta,
  });
}
