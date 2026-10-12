"use client";

import { useActionState, useId } from "react";
import { inboxData } from "@/data/admin/inboxData";
import { paymentReceivedAction } from "@/app/(admin)/_actions/inbox";
import { FormAlert } from "@/components/ui/Field";

const P = inboxData.orders.payment.record;
const control =
  "h-11 w-full rounded-xl bg-white px-3 text-[0.95rem] ring-1 ring-line outline-none focus:ring-2 focus:ring-brand-500";

/** Staff record a payment taken outside the website. The server refuses if it's already paid. */
export default function PaymentReceived({ id, method }) {
  const [state, formAction, pending] = useActionState(paymentReceivedAction, {});
  const uid = useId();

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(P.confirm)) e.preventDefault();
      }}
      className="flex flex-col gap-3 rounded-xl bg-paper p-4 ring-1 ring-line"
    >
      <input type="hidden" name="id" value={id} />
      <div>
        <p className="font-semibold">{P.heading}</p>
        <p className="text-sm text-ink-muted">{P.hint}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${uid}-m`} className="text-sm font-semibold">
            {P.method}
          </label>
          <select id={`${uid}-m`} name="method" defaultValue={method} className={control}>
            {Object.entries(P.methods).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${uid}-t`} className="text-sm font-semibold">
            {P.trxId}
          </label>
          <input id={`${uid}-t`} name="trxId" maxLength={80} autoComplete="off" className={control} />
        </div>
      </div>
      <FormAlert>{state.ok === false ? state.message : null}</FormAlert>
      <div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-60"
        >
          {P.submit}
        </button>
      </div>
    </form>
  );
}
