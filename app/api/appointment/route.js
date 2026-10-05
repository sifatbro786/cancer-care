import { z } from "zod";
import { appointmentData } from "@/data/appointmentData";
import { servicesData } from "@/data/servicesData";
import { appointmentSchema } from "@/lib/validation/appointment";
import { formatIsoDay, formatSlot } from "@/lib/schedule";
import { rateLimit } from "@/lib/server/rateLimit";
import { getClientIp, isSameOrigin, makeReference, reply } from "@/lib/server/request";
import { sendMail } from "@/lib/server/mailer";
import { appointmentEmails } from "@/lib/server/emailTemplates";

const MAX_BODY = 16 * 1024;

/**
 * POST /api/appointment — JSON body (see lib/validation/appointment.js).
 * Pipeline: origin check → rate limit → size cap → honeypot → zod → email.
 * Backend phase: persist to DB before emailing; the response contract stays the same.
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

  // Bot filled the hidden field → pretend success, send nothing
  if (body?.company) return reply.ok({ reference: makeReference() });

  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) return reply.invalid(z.flattenError(parsed.error).fieldErrors);

  const a = parsed.data;
  const reference = makeReference();
  const details = {
    ...a,
    reference,
    typeLabel: appointmentData.types.find((t) => t.key === a.type)?.title ?? a.type,
    serviceLabel: servicesData.find((s) => s.slug === a.service)?.title,
    dateLabel: formatIsoDay(a.date),
    slotLabel: formatSlot(a.slot),
  };
  const mail = appointmentEmails(details);

  const sent = await sendMail({ ...mail.clinic, replyTo: a.email });
  if (!sent) return reply.failed();

  // Patient confirmation is best-effort — never fail the request because of it
  if (mail.patient) await sendMail({ to: a.email, ...mail.patient });

  return reply.ok({ reference });
}
