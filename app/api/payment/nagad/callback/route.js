import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/payments/config";
import { getClientIp } from "@/lib/server/request";
import { handleNagadCallback } from "@/services/payments";

/**
 * GET /api/payment/nagad/callback?payment_ref_id=&order_id=&status=
 * Nagad sends the customer's browser here. The status is re-checked with Nagad's
 * verify API before anything is marked paid.
 */
export async function GET(request) {
  const sp = request.nextUrl.searchParams;
  const { reference, result } = await handleNagadCallback({
    paymentRefId: sp.get("payment_ref_id") ?? "",
    ip: getClientIp(request),
  });
  const qs = new URLSearchParams({ result, ...(reference ? { ref: reference } : {}) });
  return NextResponse.redirect(siteUrl(`/payment?${qs}`), 303);
}
