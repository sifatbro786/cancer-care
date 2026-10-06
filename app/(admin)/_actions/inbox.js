"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { inboxData } from "@/data/admin/inboxData";
import { LOGIN_PATH } from "@/lib/auth/config";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { authorize } from "@/lib/auth/session";
import { audit } from "@/lib/server/audit";
import { APPOINTMENT_FLOW, MESSAGE_FLOW, ORDER_FLOW } from "@/lib/inbox/workflow";
import {
  addNote,
  markMessageRead,
  reviewPrescription,
  setMessageStatus,
  transitionAppointment,
  transitionOrder,
} from "@/services/admin/inbox";

/**
 * Inbox Server Actions — each authorizes itself (inbox:write), validates with zod,
 * delegates to the DAL, and refresh()es the screen. A "conflict" (someone else changed
 * the record first) also refreshes, so the admin immediately sees the current state.
 */

const E = inboxData.errors;
const objectId = z.string().regex(/^[a-f0-9]{24}$/);
const statusOf = (flow) => z.enum(Object.keys(flow));
const noteText = z.string().trim().max(2000, E.noteLong);

async function guard() {
  const auth = await authorize(PERMISSIONS.inboxWrite);
  if (auth.status === 401) redirect(`${LOGIN_PATH}?reason=expired`);
  return auth;
}

/** Runs the DAL call; on success records `entry` in the audit log (ids/statuses only — no patient data). */
async function run(fn, entry) {
  let res;
  try {
    res = await fn();
  } catch (err) {
    console.error("[inbox action]", err?.message);
    return { ok: false, message: E.server };
  }
  if (res.ok && entry) await audit(entry);
  if (res.ok || res.code === "conflict") refresh();
  return res.ok ? { ok: true } : { ok: false, message: E[res.code] ?? E.server };
}

const field = (fd, k) => (typeof fd.get(k) === "string" ? fd.get(k) : undefined);

export async function appointmentStatusAction(_prev, fd) {
  const auth = await guard();
  if (!auth.ok) return { ok: false, message: E.invalid };
  const p = z
    .object({ id: objectId, from: statusOf(APPOINTMENT_FLOW), to: statusOf(APPOINTMENT_FLOW), note: noteText.optional() })
    .safeParse({ id: field(fd, "id"), from: field(fd, "from"), to: field(fd, "to"), note: field(fd, "note") });
  if (!p.success) return { ok: false, message: p.error.issues[0]?.message ?? E.invalid };
  return run(() => transitionAppointment({ ...p.data, note: p.data.note || undefined, userId: auth.user.id }), {
    action: "inbox.appointment_status",
    user: auth.user,
    target: { type: "appointment", id: p.data.id },
    meta: { from: p.data.from, to: p.data.to },
  });
}

export async function orderStatusAction(_prev, fd) {
  const auth = await guard();
  if (!auth.ok) return { ok: false, message: E.invalid };
  const p = z
    .object({ id: objectId, from: statusOf(ORDER_FLOW), to: statusOf(ORDER_FLOW), note: noteText.optional() })
    .safeParse({ id: field(fd, "id"), from: field(fd, "from"), to: field(fd, "to"), note: field(fd, "note") });
  if (!p.success) return { ok: false, message: p.error.issues[0]?.message ?? E.invalid };
  return run(() => transitionOrder({ ...p.data, note: p.data.note || undefined, userId: auth.user.id }), {
    action: "inbox.order_status",
    user: auth.user,
    target: { type: "order", id: p.data.id },
    meta: { from: p.data.from, to: p.data.to },
  });
}

export async function prescriptionReviewAction(_prev, fd) {
  const auth = await guard();
  if (!auth.ok) return { ok: false, message: E.invalid };
  const p = z
    .object({ id: objectId, decision: z.enum(["verified", "rejected"]), reason: noteText.optional() })
    .refine((v) => v.decision !== "rejected" || (v.reason && v.reason.length >= 3), { message: E.reasonRequired })
    .safeParse({ id: field(fd, "id"), decision: field(fd, "decision"), reason: field(fd, "reason") });
  if (!p.success) return { ok: false, message: p.error.issues[0]?.message ?? E.invalid };
  return run(() =>
    reviewPrescription({
      id: p.data.id,
      decision: p.data.decision,
      reason: p.data.decision === "rejected" ? p.data.reason : undefined,
      userId: auth.user.id,
    }),
    { action: "inbox.prescription_review", user: auth.user, target: { type: "order", id: p.data.id }, meta: { decision: p.data.decision } }
  );
}

export async function messageStatusAction(_prev, fd) {
  const auth = await guard();
  if (!auth.ok) return { ok: false, message: E.invalid };
  const p = z
    .object({ id: objectId, from: statusOf(MESSAGE_FLOW), to: statusOf(MESSAGE_FLOW) })
    .safeParse({ id: field(fd, "id"), from: field(fd, "from"), to: field(fd, "to") });
  if (!p.success) return { ok: false, message: E.invalid };
  return run(() => setMessageStatus({ ...p.data, userId: auth.user.id }), {
    action: "inbox.message_status",
    user: auth.user,
    target: { type: "message", id: p.data.id },
    meta: { from: p.data.from, to: p.data.to },
  });
}

/** Called once by the message page on view. Read-only roles simply don't mark. */
export async function markMessageReadAction(id) {
  const auth = await authorize(PERMISSIONS.inboxWrite);
  if (!auth.ok || !objectId.safeParse(id).success) return { ok: false };
  try {
    const res = await markMessageRead({ id, userId: auth.user.id });
    if (res.changed) refresh(); // update sidebar badge + status pill
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function addNoteAction(_prev, fd) {
  const auth = await guard();
  if (!auth.ok) return { ok: false, message: E.invalid };
  const p = z
    .object({ kind: z.enum(["appointment", "order"]), id: objectId, text: noteText.min(1, E.noteEmpty) })
    .safeParse({ kind: field(fd, "kind"), id: field(fd, "id"), text: field(fd, "text") ?? "" });
  if (!p.success) return { ok: false, message: p.error.issues[0]?.message ?? E.invalid };
  const res = await run(() => addNote({ ...p.data, userId: auth.user.id }), {
    action: "inbox.note",
    user: auth.user,
    target: { type: p.data.kind, id: p.data.id },
  });
  return res.ok ? { ok: true, at: Date.now() } : res;
}
