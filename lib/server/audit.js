import "server-only";
import { headers } from "next/headers";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { AuditLog } from "@/lib/db/models";
import { getClientIp } from "@/lib/server/request";

/**
 * Write one audit entry. Fire-and-forget by design: a logging failure must never
 * break the action being logged, so this never throws (it logs to stderr instead).
 *
 * @param {object} p
 * @param {string} p.action   dotted verb, e.g. "content.update", "user.disable"
 * @param {{id,name,email}=} p.user  the actor (DTO from getCurrentUser); omit for anonymous
 * @param {{type,id,label}=} p.target
 * @param {object=} p.meta    small, non-sensitive details — never passwords, tokens or patient data
 * @param {string=} p.ip      pass it in Route Handlers; Server Actions read it from headers()
 */
export async function audit({ action, user, target, meta, ip }) {
  if (!isDbConfigured()) return;
  try {
    let addr = ip;
    if (!addr) {
      try {
        addr = getClientIp({ headers: await headers() });
      } catch {
        addr = undefined; // outside a request (scripts)
      }
    }
    await connectDB();
    await AuditLog.create({
      action,
      actor: user?.id,
      actorName: user?.name,
      actorEmail: user?.email,
      target: target
        ? { type: target.type, id: target.id ? String(target.id) : undefined, label: target.label?.slice(0, 200) }
        : undefined,
      meta,
      ip: addr?.slice(0, 64),
    });
  } catch (err) {
    console.error(`[audit] failed to record ${action}:`, err?.message);
  }
}
