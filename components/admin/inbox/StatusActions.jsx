"use client";

import { useActionState, useState } from "react";
import { inboxData } from "@/data/admin/inboxData";
import { cn } from "@/lib/utils";
import { FormAlert } from "@/components/ui/Field";

const C = inboxData.common;

const btn =
  "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";
const tones = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-white text-ink ring-1 ring-line hover:ring-brand-300",
  danger: "bg-white text-alert-700 ring-1 ring-alert-600/30 hover:bg-alert-50",
};

/**
 * Status buttons for one record. The submitting button's name/value carries `to`;
 * `from` is the status the admin is looking at (server rejects it if it changed meanwhile).
 * Destructive options (danger) open a second step with an optional/required note.
 *
 * options: [{ to, label, tone: "primary"|"secondary"|"danger", note?: "optional"|"required", hint? }]
 */
export default function StatusActions({ action, id, from, options, disabledReason }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [staged, setStaged] = useState(null); // option awaiting confirmation

  if (!options.length) return null;
  const stagedOpt = options.find((o) => o.to === staged);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="from" value={from} />
      <FormAlert>{state.ok === false ? state.message : null}</FormAlert>
      {disabledReason ? <FormAlert tone="info">{disabledReason}</FormAlert> : null}

      {stagedOpt ? (
        <div className="flex flex-col gap-3 rounded-xl bg-alert-50/60 p-4 ring-1 ring-alert-600/20">
          <p className="text-sm text-ink">{stagedOpt.hint ?? C.confirmCancel}</p>
          <label htmlFor={`note-${id}`} className="text-sm font-semibold">
            {stagedOpt.note === "required" ? C.reasonLabel : C.reasonOptional}
          </label>
          <textarea
            id={`note-${id}`}
            name="note"
            rows={2}
            maxLength={2000}
            required={stagedOpt.note === "required"}
            className="rounded-xl bg-white px-3 py-2 text-[0.95rem] ring-1 ring-line outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex flex-wrap gap-2">
            <button type="submit" name="to" value={stagedOpt.to} disabled={pending} className={cn(btn, "bg-alert-600 text-white hover:bg-alert-700")}>
              {stagedOpt.label}
            </button>
            <button type="button" onClick={() => setStaged(null)} className={cn(btn, tones.secondary)}>
              {C.keep}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((o) =>
            o.tone === "danger" ? (
              <button key={o.to} type="button" onClick={() => setStaged(o.to)} className={cn(btn, tones.danger)}>
                {o.label}
              </button>
            ) : (
              <button
                key={o.to}
                type="submit"
                name="to"
                value={o.to}
                disabled={pending || Boolean(o.disabled)}
                className={cn(btn, tones[o.tone ?? "secondary"])}
              >
                {o.label}
              </button>
            )
          )}
        </div>
      )}
    </form>
  );
}
