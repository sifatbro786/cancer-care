"use client";

import { useActionState, useState } from "react";
import { inboxData } from "@/data/admin/inboxData";
import { prescriptionReviewAction } from "@/app/(admin)/_actions/inbox";
import { FormAlert } from "@/components/ui/Field";

const R = inboxData.orders.rx;

/** Verify in one click; Reject needs a reason (it becomes a note and, if required, cancels the order). */
export default function PrescriptionReview({ id, required }) {
  const [state, formAction, pending] = useActionState(prescriptionReviewAction, {});
  const [rejecting, setRejecting] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <FormAlert>{state.ok === false ? state.message : null}</FormAlert>

      {rejecting ? (
        <div className="flex flex-col gap-3 rounded-xl bg-alert-50/60 p-4 ring-1 ring-alert-600/20">
          <label htmlFor={`reason-${id}`} className="text-sm font-semibold">
            {R.rejectReason}
          </label>
          <textarea
            id={`reason-${id}`}
            name="reason"
            rows={2}
            required
            minLength={3}
            maxLength={2000}
            className="rounded-xl bg-white px-3 py-2 text-[0.95rem] ring-1 ring-line outline-none focus:ring-2 focus:ring-brand-500"
          />
          {required ? <p className="text-sm text-alert-700">{R.rejectNote}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              name="decision"
              value="rejected"
              disabled={pending}
              className="rounded-xl bg-alert-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-alert-700 disabled:opacity-60"
            >
              {R.reject}
            </button>
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-line hover:ring-brand-300"
            >
              {inboxData.common.keep}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="decision"
            value="verified"
            disabled={pending}
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            {R.verify}
          </button>
          <button
            type="button"
            onClick={() => setRejecting(true)}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-alert-700 ring-1 ring-alert-600/30 hover:bg-alert-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            {R.reject}
          </button>
        </div>
      )}
    </form>
  );
}
