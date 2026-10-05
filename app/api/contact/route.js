import { z } from "zod";
import { contactData } from "@/data/contactData";
import { contactSchema } from "@/lib/validation/contact";
import { rateLimit } from "@/lib/server/rateLimit";
import { getClientIp, isSameOrigin, makeReference, reply } from "@/lib/server/request";
import { sendMail } from "@/lib/server/mailer";
import { contactEmail } from "@/lib/server/emailTemplates";

const MAX_BODY = 16 * 1024;

/** POST /api/contact — JSON body (see lib/validation/contact.js). */
export async function POST(request) {
  if (!isSameOrigin(request)) return reply.forbidden();

  const limit = rateLimit(`contact:${getClientIp(request)}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) return reply.limited(limit.retryAfter);

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return reply.invalid({});

  let body;
  try {
    body = await request.json();
  } catch {
    return reply.invalid({});
  }

  if (body?.company) return reply.ok({ reference: makeReference("MSG") });

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return reply.invalid(z.flattenError(parsed.error).fieldErrors);

  const c = parsed.data;
  const subjectLabel =
    contactData.form.fields.subject.options.find((o) => o.value === c.subject)?.label ?? c.subject;

  const sent = await sendMail({ ...contactEmail({ ...c, subjectLabel }), replyTo: c.email });
  if (!sent) return reply.failed();

  return reply.ok({ reference: makeReference("MSG") });
}
