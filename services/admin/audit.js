import "server-only";
import { trusted } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { AuditLog } from "@/lib/db/models";

/** Audit log reader (B6) — callers MUST have run authorize(PERMISSIONS.auditRead). */

const PER_PAGE = 50;
export const AUDIT_GROUPS = Object.freeze(["all", "auth", "content", "inbox", "media", "user"]);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function listAudit({ page = 1, group = "all", q = "" } = {}) {
  await connectDB();
  const g = AUDIT_GROUPS.includes(group) ? group : "all";
  const term = String(q ?? "").trim().slice(0, 80);
  const filter = {};
  // prefix match on the indexed `action` field; trusted() marks OUR operator (input is escaped)
  if (g !== "all") filter.action = trusted({ $regex: `^${g}\\.` });
  if (term) {
    const rx = trusted({ $regex: escapeRegex(term), $options: "i" });
    filter.$or = [{ actorEmail: rx }, { actorName: rx }, { "target.label": rx }];
  }

  const total = await AuditLog.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(Math.max(1, Math.floor(Number(page)) || 1), pages);
  const docs = await AuditLog.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip((current - 1) * PER_PAGE)
    .limit(PER_PAGE)
    .lean();

  return {
    items: docs.map((d) => ({
      id: String(d._id),
      at: d.createdAt?.toISOString(),
      action: d.action,
      actor: d.actorName || d.actorEmail || null,
      actorEmail: d.actorEmail || null,
      target: d.target?.label || d.target?.type || null,
      targetType: d.target?.type || null,
      meta: d.meta ?? null,
      ip: d.ip ?? null,
    })),
    total,
    page: current,
    pages,
    group: g,
    q: term,
  };
}
