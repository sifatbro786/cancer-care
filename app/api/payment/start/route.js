import { z } from "zod";
import { formMessages as M } from "@/data/formMessages";
import { paymentStartSchema } from "@/lib/validation/order";
import { rateLimit } from "@/lib/server/rateLimit";
import { getClientIp, isSameOrigin, reply } from "@/lib/server/request";
import { startPayment } from "@/services/payments";

/**
 * POST /api/payment/start  { reference, method }
 * Retry an online payment for an order that is open and not yet paid (from /payment).
 * Only ever lets someone PAY an order — it reveals and changes nothing else.
 */
export async function POST(request) {
  if (!isSameOrigin(request)) return reply.forbidden();

  const limit = rateLimit(`pay:${getClientIp(request)}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) return reply.limited(limit.retryAfter);

  let body;
  try {
    body = await request.json();
  } catch {
    return reply.invalid({});
  }
  const parsed = paymentStartSchema.safeParse(body);
  if (!parsed.success) return reply.invalid(z.flattenError(parsed.error).fieldErrors);

  const res = await startPayment({ ...parsed.data, ip: getClientIp(request) });
  if (res.ok) return reply.ok({ redirectUrl: res.redirectUrl });
  if (res.code === "gateway") return reply.failed();
  return reply.invalid({ method: [M.paymentCodes[res.code] ?? M.paymentUnavailable] });
}
