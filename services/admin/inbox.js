import "server-only";
import mongoose, { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Appointment, Message, Order, User } from "@/lib/db/models";
import { toPlain } from "@/lib/db/serialize";
import {
  APPOINTMENT_FLOW,
  canTransition,
  MESSAGE_FLOW,
  ORDER_FLOW,
  orderBlockedReason,
  PRESCRIPTION_REVIEW,
} from "@/lib/inbox/workflow";

/**
 * Inbox DAL — appointments, orders, messages.
 * Callers MUST authorize first (inbox:read for reads, inbox:write for mutations).
 *
 * Concurrency: every status change is a conditional update on the status the admin SAW
 * ({ _id, status: from }). If someone else changed it first, matchedCount is 0 and we
 * return "conflict" instead of silently overwriting their decision.
 */

export const PER_PAGE = 20;
const trusted = mongoose.trusted;

/* ── helpers ─────────────────────────────────────────────────────── */

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Free-text search → $or filter. Reference (prefix, case-insensitive), name (contains),
 * phone (digits only, so "+880 1712-345678" finds "01712345678").
 */
function searchFilter(q, { name, phone }) {
  const term = String(q ?? "").trim().slice(0, 60);
  if (!term) return {};
  // trusted() goes on each operator VALUE (that's where sanitizeFilter looks); the input is escaped.
  const or = [{ reference: trusted({ $regex: `^${escapeRegex(term.toUpperCase())}` }) }];
  if (name) or.push({ [name]: trusted({ $regex: escapeRegex(term), $options: "i" }) });
  const digits = term.replace(/\D/g, "");
  if (phone && digits.length >= 4) or.push({ [phone]: trusted({ $regex: escapeRegex(digits.slice(-10)) }) });
  return { $or: or };
}

const pageOf = (p) => Math.max(1, Math.min(10_000, Math.floor(Number(p)) || 1));

async function paginate(Model, filter, sort, page, project) {
  const total = await Model.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(pageOf(page), pages);
  const docs = await Model.find(filter)
    .sort(sort)
    .skip((current - 1) * PER_PAGE)
    .limit(PER_PAGE)
    .lean();
  return { items: docs.map(project), total, page: current, pages };
}

async function countTabs(Model, tabs) {
  const entries = await Promise.all(
    Object.entries(tabs).map(async ([key, t]) => [key, await Model.countDocuments(t.filter)])
  );
  return Object.fromEntries(entries);
}

/** Resolve user ids in notes / history to display names (one query). */
async function withAuthors(doc) {
  const ids = [...(doc.notes ?? []), ...(doc.statusHistory ?? []), ...(doc.prescription?.reviewedBy ? [{ by: doc.prescription.reviewedBy }] : [])]
    .map((x) => x.by)
    .filter(Boolean)
    .map(String);
  const unique = [...new Set(ids)].filter(isValidObjectId);
  const users = unique.length ? await User.find({ _id: trusted({ $in: unique }) }).select("name").lean() : [];
  const names = new Map(users.map((u) => [String(u._id), u.name]));
  const by = (x) => ({ ...x, by: x.by ? names.get(String(x.by)) ?? null : null });
  return {
    notes: (doc.notes ?? []).map(by).reverse(), // newest first
    history: (doc.statusHistory ?? []).map(by),
    reviewer: doc.prescription?.reviewedBy ? names.get(String(doc.prescription.reviewedBy)) ?? null : null,
  };
}

const conflictOr = (res) => (res.matchedCount ? { ok: true } : { ok: false, code: "conflict" });

/* ── appointments ────────────────────────────────────────────────── */

const APPOINTMENT_TABS = {
  new: { filter: { status: "new" }, sort: { startsAt: 1, _id: 1 } },
  confirmed: { filter: { status: "confirmed" }, sort: { startsAt: 1, _id: 1 } },
  completed: { filter: { status: "completed" }, sort: { startsAt: -1, _id: -1 } },
  cancelled: { filter: { status: "cancelled" }, sort: { startsAt: -1, _id: -1 } },
  all: { filter: {}, sort: { createdAt: -1, _id: -1 } },
};
export const APPOINTMENT_TAB_KEYS = Object.keys(APPOINTMENT_TABS);

const appointmentRow = (a) => ({
  id: String(a._id),
  reference: a.reference,
  type: a.type,
  service: a.service?.title ?? null,
  date: a.date,
  slot: a.slot,
  name: a.patient?.name,
  phone: a.patient?.phone,
  visit: a.visit,
  status: a.status,
  emailed: a.notification?.clinicEmailed !== false,
  createdAt: a.createdAt?.toISOString(),
});

export async function listAppointments({ tab = "new", q, page } = {}) {
  await connectDB();
  const t = APPOINTMENT_TABS[tab] ?? APPOINTMENT_TABS.new;
  const filter = { ...t.filter, ...searchFilter(q, { name: "patient.name", phone: "patient.phone" }) };
  const [list, counts] = await Promise.all([
    paginate(Appointment, filter, t.sort, page, appointmentRow),
    countTabs(Appointment, APPOINTMENT_TABS),
  ]);
  return { ...list, counts };
}

export async function getAppointment(id) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const a = await Appointment.findById(id).lean();
  if (!a) return null;
  const { notes, history } = await withAuthors(a);
  const p = toPlain(a);
  return {
    ...appointmentRow(a),
    email: p.patient?.email ?? null,
    age: p.patient?.age ?? null,
    message: p.message ?? "",
    consentAt: p.consentAt,
    notes,
    history,
  };
}

export async function transitionAppointment({ id, from, to, userId, note }) {
  if (!isValidObjectId(id) || !canTransition(APPOINTMENT_FLOW, from, to)) return { ok: false, code: "invalid" };
  await connectDB();
  const now = new Date();
  const push = { statusHistory: { status: to, by: userId, at: now } };
  if (note) push.notes = { text: note, by: userId, at: now };
  return conflictOr(await Appointment.updateOne({ _id: id, status: from }, { $set: { status: to }, $push: push }));
}

/** Today's chamber/online schedule (Asia/Dhaka) for the overview. */
export async function todaysAppointments() {
  await connectDB();
  const d = new Date(Date.now() + 6 * 3600 * 1000);
  const day = d.toISOString().slice(0, 10);
  const list = await Appointment.find({ date: day, status: trusted({ $in: ["new", "confirmed"] }) })
    .sort({ slot: 1 })
    .limit(30)
    .lean();
  return { day, items: list.map(appointmentRow) };
}

/* ── orders ──────────────────────────────────────────────────────── */

const ORDER_TABS = {
  rx: { filter: { "prescription.status": "pending" }, sort: { createdAt: 1, _id: 1 } }, // oldest first — a queue
  new: { filter: { status: "new" }, sort: { createdAt: -1, _id: -1 } },
  processing: { filter: { status: "processing" }, sort: { createdAt: -1, _id: -1 } },
  dispatched: { filter: { status: "dispatched" }, sort: { createdAt: -1, _id: -1 } },
  delivered: { filter: { status: "delivered" }, sort: { createdAt: -1, _id: -1 } },
  cancelled: { filter: { status: "cancelled" }, sort: { createdAt: -1, _id: -1 } },
  all: { filter: {}, sort: { createdAt: -1, _id: -1 } },
};
export const ORDER_TAB_KEYS = Object.keys(ORDER_TABS);

/** Tab → Mongo filter, shared with the CSV export (same tabs, same meaning). */
export function inboxTabFilter(kind, tab) {
  const tabs = kind === "appointments" ? APPOINTMENT_TABS : kind === "orders" ? ORDER_TABS : null;
  if (!tabs) return null;
  return (Object.hasOwn(tabs, tab) ? tabs[tab] : tabs.all).filter;
}

const orderRow = (o) => ({
  id: String(o._id),
  reference: o.reference,
  items: (o.items ?? []).map((i) => ({ name: i.name, quantity: i.quantity, unitPrice: i.unitPrice, coldChain: i.coldChain })),
  subtotal: o.subtotal ?? 0,
  name: o.customer?.name,
  phone: o.customer?.phone,
  status: o.status,
  rxRequired: Boolean(o.prescription?.required),
  rxStatus: o.prescription?.status ?? "not_required",
  hasFile: Boolean(o.prescription?.file?.path),
  emailed: o.notification?.clinicEmailed !== false,
  createdAt: o.createdAt?.toISOString(),
});

export async function listOrders({ tab = "rx", q, page } = {}) {
  await connectDB();
  const t = ORDER_TABS[tab] ?? ORDER_TABS.rx;
  const filter = { ...t.filter, ...searchFilter(q, { name: "customer.name", phone: "customer.phone" }) };
  const [list, counts] = await Promise.all([paginate(Order, filter, t.sort, page, orderRow), countTabs(Order, ORDER_TABS)]);
  return { ...list, counts };
}

export async function getOrder(id) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const o = await Order.findById(id).lean();
  if (!o) return null;
  const { notes, history, reviewer } = await withAuthors(o);
  return {
    ...orderRow(o),
    address: o.customer?.address,
    note: o.note ?? "",
    file: o.prescription?.file ? { mime: o.prescription.file.mime, size: o.prescription.file.size } : null,
    reviewedAt: o.prescription?.reviewedAt?.toISOString() ?? null,
    reviewer,
    rejectReason: o.prescription?.rejectReason ?? "",
    notes,
    history,
  };
}

export async function transitionOrder({ id, from, to, userId, note }) {
  if (!isValidObjectId(id) || !canTransition(ORDER_FLOW, from, to)) return { ok: false, code: "invalid" };
  await connectDB();
  const order = await Order.findById(id).select("status prescription").lean();
  if (!order) return { ok: false, code: "notFound" };
  const blocked = orderBlockedReason(order, to);
  if (blocked) return { ok: false, code: blocked };

  const now = new Date();
  const push = { statusHistory: { status: to, by: userId, at: now } };
  if (note) push.notes = { text: note, by: userId, at: now };
  return conflictOr(await Order.updateOne({ _id: id, status: from }, { $set: { status: to }, $push: push }));
}

/**
 * Pharmacist decision. Rejecting a REQUIRED prescription also cancels the order
 * (it could never be dispatched). The reason is kept on the order and in the notes.
 */
export async function reviewPrescription({ id, decision, reason, userId }) {
  if (!isValidObjectId(id) || !canTransition(PRESCRIPTION_REVIEW, "pending", decision)) {
    return { ok: false, code: "invalid" };
  }
  await connectDB();
  const now = new Date();
  const set = {
    "prescription.status": decision,
    "prescription.reviewedBy": userId,
    "prescription.reviewedAt": now,
  };
  if (decision === "rejected") set["prescription.rejectReason"] = reason;

  const res = await Order.updateOne(
    { _id: id, "prescription.status": "pending" },
    { $set: set, ...(reason ? { $push: { notes: { text: reason, by: userId, at: now } } } : {}) }
  );
  if (!res.matchedCount) return { ok: false, code: "conflict" };

  if (decision === "rejected") {
    await Order.updateOne(
      { _id: id, "prescription.required": true, status: trusted({ $in: ["new", "processing"] }) },
      { $set: { status: "cancelled" }, $push: { statusHistory: { status: "cancelled", by: userId, at: now } } }
    );
  }
  return { ok: true };
}

/* ── messages ────────────────────────────────────────────────────── */

const MESSAGE_TABS = {
  unread: { filter: { status: "unread" }, sort: { createdAt: -1, _id: -1 } },
  read: { filter: { status: "read" }, sort: { createdAt: -1, _id: -1 } },
  archived: { filter: { status: "archived" }, sort: { createdAt: -1, _id: -1 } },
  all: { filter: {}, sort: { createdAt: -1, _id: -1 } },
};
export const MESSAGE_TAB_KEYS = Object.keys(MESSAGE_TABS);

const messageRow = (m) => ({
  id: String(m._id),
  reference: m.reference,
  name: m.name,
  phone: m.phone,
  email: m.email ?? null,
  subject: m.subject,
  preview: (m.message ?? "").slice(0, 140),
  status: m.status,
  emailed: m.notification?.clinicEmailed !== false,
  createdAt: m.createdAt?.toISOString(),
});

export async function listMessages({ tab = "unread", q, page } = {}) {
  await connectDB();
  const t = MESSAGE_TABS[tab] ?? MESSAGE_TABS.unread;
  const filter = { ...t.filter, ...searchFilter(q, { name: "name", phone: "phone" }) };
  const [list, counts] = await Promise.all([
    paginate(Message, filter, t.sort, page, messageRow),
    countTabs(Message, MESSAGE_TABS),
  ]);
  return { ...list, counts };
}

export async function getMessage(id) {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const m = await Message.findById(id).lean();
  if (!m) return null;
  const readBy = m.readBy ? await User.findById(m.readBy).select("name").lean() : null;
  return { ...messageRow(m), message: m.message, readAt: m.readAt?.toISOString() ?? null, readBy: readBy?.name ?? null };
}

export async function setMessageStatus({ id, from, to, userId }) {
  if (!isValidObjectId(id) || !canTransition(MESSAGE_FLOW, from, to)) return { ok: false, code: "invalid" };
  await connectDB();
  const set = { status: to };
  if (to === "read" && from === "unread") Object.assign(set, { readAt: new Date(), readBy: userId });
  return conflictOr(await Message.updateOne({ _id: id, status: from }, { $set: set }));
}

/** Opening an unread message marks it read (no-op if someone already did). */
export async function markMessageRead({ id, userId }) {
  if (!isValidObjectId(id)) return { ok: false };
  await connectDB();
  const res = await Message.updateOne(
    { _id: id, status: "unread" },
    { $set: { status: "read", readAt: new Date(), readBy: userId } }
  );
  return { ok: true, changed: res.modifiedCount > 0 };
}

/* ── shared ──────────────────────────────────────────────────────── */

const NOTE_MODELS = { appointment: Appointment, order: Order };

export async function addNote({ kind, id, text, userId }) {
  const Model = NOTE_MODELS[kind];
  if (!Model || !isValidObjectId(id)) return { ok: false, code: "invalid" };
  await connectDB();
  const res = await Model.updateOne({ _id: id }, { $push: { notes: { text, by: userId, at: new Date() } } });
  return res.matchedCount ? { ok: true } : { ok: false, code: "notFound" };
}

/** Sidebar badges. */
export async function getInboxBadges() {
  await connectDB();
  const [appointments, orders, messages] = await Promise.all([
    Appointment.countDocuments({ status: "new" }),
    Order.countDocuments({ "prescription.status": "pending" }),
    Message.countDocuments({ status: "unread" }),
  ]);
  return { appointments, orders, messages };
}
