import { z } from "zod";
import { appointmentData } from "@/data/appointmentData";
import { formMessages as M } from "@/data/formMessages";
import { appointmentSchema } from "@/lib/validation/appointment";
import { formatIsoDay, formatSlot } from "@/lib/schedule";
import { rateLimit } from "@/lib/server/rateLimit";
import { getClientIp, isSameOrigin, makeReference, reply, requestMeta } from "@/lib/server/request";
import { sendMail } from "@/lib/server/mailer";
import { appointmentEmails } from "@/lib/server/emailTemplates";
import { getServiceBySlug } from "@/services/content";
import { markNotified, saveAppointment } from "@/services/submissions";

const MAX_BODY = 16 * 1024;

/**
 * POST /api/appointment — JSON body (see lib/validation/appointment.js).
 * Pipeline: origin check → rate limit → size cap → honeypot → zod → service lookup
 *           → save to DB → email (clinic + patient copy). Accepted if EITHER the save or the clinic email succeeds.
 * Response contract unchanged: { ok, reference } | { ok:false, message, fieldErrors }.
 */
export async function POST(request) {
  if (!isSameOrigin(request)) return reply.forbidden();

  const limit = rateLimit(`appointment:${getClientIp(request)}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) return reply.limited(limit.retryAfter);

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return reply.invalid({});

  let body;
  try {
    body = await request.json();
  } catch {
    return reply.invalid({});
  }

  // Bot filled the hidden field → pretend success, store/send nothing
  if (body?.company) return reply.ok({ reference: makeReference() });

  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) return reply.invalid(z.flattenError(parsed.error).fieldErrors);

  const a = parsed.data;

  // Service must exist and be active in the live catalogue
  const service = a.service ? await getServiceBySlug(a.service) : null;
  if (a.service && !service) return reply.invalid({ service: [M.service] });

  let record = null;
  try {
    record = await saveAppointment(a, { service, meta: requestMeta(request) });
  } catch (err) {
    // DB down → degrade to email-only rather than lose the request; 502 only if email fails too
    console.error("[appointment] save failed, falling back to email-only:", err?.message);
  }

  const reference = record?.reference ?? makeReference();
  const mail = appointmentEmails({
    ...a,
    reference,
    typeLabel: appointmentData.types.find((t) => t.key === a.type)?.title ?? a.type,
    serviceLabel: service?.title,
    dateLabel: formatIsoDay(a.date),
    slotLabel: formatSlot(a.slot),
    adminPath: record ? `/admin/appointments/${record.id}` : null,
  });

  const sent = await sendMail({ ...mail.clinic, replyTo: a.email });
  await markNotified(record, sent);
  // Saved in the DB → the request is accepted even if the email failed (admin inbox has it).
  if (!sent && !record) return reply.failed();

  // Patient confirmation is best-effort — never fail the request because of it
  if (mail.patient) await sendMail({ to: a.email, ...mail.patient });

  return reply.ok({ reference });
}
