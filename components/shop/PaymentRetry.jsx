"use client";

import { useState } from "react";
import { shopData } from "@/data/shopData";
import { submitForm } from "@/lib/client/submitForm";
import Button from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/Field";

/** Start a new bKash / Nagad session for an unpaid order and leave for the gateway. */
export default function PaymentRetry({ reference, methods }) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const P = shopData.payment.methods;

  async function pay(method) {
    setBusy(method);
    setError("");
    const res = await submitForm("/api/payment/start", { reference, method });
    if (res.ok && res.data.redirectUrl) {
      window.location.assign(res.data.redirectUrl);
      return; // keep the button busy while the browser navigates
    }
    setBusy(null);
    setError(res.fieldErrors?.method?.[0] ?? res.message);
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {methods.map((m) => (
          <Button key={m} onClick={() => pay(m)} disabled={Boolean(busy)} aria-busy={busy === m} withArrow>
            {shopData.paymentResult.retry(P[m].label)}
          </Button>
        ))}
      </div>
      <FormAlert>{error}</FormAlert>
    </div>
  );
}
