import "server-only";
import { trusted } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Appointment, Order } from "@/lib/db/models";
import { fromDhakaDay } from "@/lib/db/serialize";
import { inboxTabFilter } from "@/services/admin/inbox";

/**
 * CSV exports for the clinic's own records (B7). Callers MUST have run
 * authorize(PERMISSIONS.inboxRead). Patient data → the route audits every export.
 * `from`/`to` are Dhaka calendar days (inclusive); empty = open-ended.
 */
export const EXPORT_LIMIT = 10_000;

const dhaka = (d) =>
  d ? new Date(new Date(d).getTime() + 6 * 3600 * 1000).toISOString().slice(0, 16).replace("T", " ") : "";

function createdRange(from, to) {
  if (!from && !to) return {};
  const range = {};
  if (from) range.$gte = fromDhakaDay(from);
  if (to) range.$lt = new Date(fromDhakaDay(to).getTime() + 24 * 3600 * 1000);
  return { createdAt: trusted(range) }; // our operator; the days are regex-validated by the route
}

function dayRange(field, from, to) {
  if (!from && !to) return {};
  const range = {};
  if (from) range.$gte = from;
  if (to) range.$lte = to;
  return { [field]: trusted(range) };
}

const EXPORTS = {
  appointments: {
    header: ["Reference", "Requested day", "Slot", "Type", "Service", "Patient", "Phone", "Email", "Age", "Visit", "Status", "Submitted (Dhaka)", "Message"],
    // filter on the REQUESTED day — what the clinic plans by
    filter: (from, to) => dayRange("date", from, to),
    sort: { startsAt: 1, _id: 1 },
    model: Appointment,
    select: "reference date slot type service patient visit status createdAt message",
    row: (a) => [
      a.reference,
      a.date,
      a.slot,
      a.type,
      a.service?.title ?? "",
      a.patient?.name,
      a.patient?.phone,
      a.patient?.email ?? "",
      a.patient?.age ?? "",
      a.visit,
      a.status,
      dhaka(a.createdAt),
      a.message ?? "",
    ],
  },
  orders: {
    header: ["Reference", "Placed (Dhaka)", "Customer", "Phone", "Address", "Items", "Subtotal (BDT)", "Prescription", "Status", "Note"],
    filter: (from, to) => createdRange(from, to),
    sort: { createdAt: 1, _id: 1 },
    model: Order,
    select: "reference createdAt customer items subtotal prescription.status status note",
    row: (o) => [
      o.reference,
      dhaka(o.createdAt),
      o.customer?.name,
      o.customer?.phone,
      o.customer?.address,
      (o.items ?? []).map((i) => `${i.name} × ${i.quantity}`).join("; "),
      o.subtotal ?? 0,
      o.prescription?.status ?? "",
      o.status,
      o.note ?? "",
    ],
  },
};

export const EXPORT_KINDS = Object.freeze(Object.keys(EXPORTS));

/** @returns {{ header: string[], rows: any[][], truncated: boolean }} */
export async function exportRows(kind, { tab, from, to }) {
  const cfg = EXPORTS[kind];
  await connectDB();
  const filter = { ...inboxTabFilter(kind, tab), ...cfg.filter(from, to) };
  const docs = await cfg.model.find(filter).sort(cfg.sort).select(cfg.select).limit(EXPORT_LIMIT + 1).lean();
  const truncated = docs.length > EXPORT_LIMIT;
  return { header: cfg.header, rows: docs.slice(0, EXPORT_LIMIT).map(cfg.row), truncated };
}
