import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/payments/config";
import { handleBkashCallback } from "@/services/payments";

/**
 * GET /api/payment/bkash/callback?paymentID=&status=success|failure|cancel
 * bKash sends the customer's browser here. The query is only a hint: the payment is
 * executed / queried server-to-server before anything is marked paid.
 */
export async function GET(request) {
  const sp = request.nextUrl.searchParams;
  const { reference, result } = await handleBkashCallback({
    paymentID: sp.get("paymentID") ?? "",
    status: sp.get("status") ?? "",
  });
  const qs = new URLSearchParams({ result, ...(reference ? { ref: reference } : {}) });
  return NextResponse.redirect(siteUrl(`/payment?${qs}`), 303);
}
