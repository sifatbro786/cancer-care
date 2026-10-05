"use client";

import { useActionState } from "react";
import { inboxData } from "@/data/admin/inboxData";
import { addNoteAction } from "@/app/(admin)/_actions/inbox";
import { formatDateTime } from "@/lib/utils";
import { FormAlert } from "@/components/ui/Field";

const N = inboxData.common.notes;

/** Append-only internal notes. Each note records who wrote it and when. */
export default function NotesPanel({ kind, id, notes, canWrite }) {
  const [state, formAction, pending] = useActionState(addNoteAction, {});

  return (
    <section aria-labelledby="notes-heading" className="flex flex-col gap-4">
      <h2 id="notes-heading" className="text-lg font-semibold">
        {N.heading}
      </h2>

      {canWrite ? (
        // key resets the textarea after each successful save
        <form key={state.at ?? "form"} action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={id} />
          <label htmlFor="note-text" className="sr-only">
            {N.label}
          </label>
          <textarea
            id="note-text"
            name="text"
            rows={3}
            maxLength={2000}
            placeholder={N.placeholder}
            className="rounded-xl bg-white px-3.5 py-2.5 text-[0.95rem] ring-1 ring-line outline-none focus:ring-2 focus:ring-brand-500"
          />
          <FormAlert>{state.ok === false ? state.message : null}</FormAlert>
          <button
            type="submit"
            disabled={pending}
            className="self-start rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-800 ring-1 ring-line hover:ring-brand-300 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            {N.submit}
          </button>
        </form>
      ) : null}

      {notes.length ? (
        <ul className="flex flex-col gap-3">
          {notes.map((n, i) => (
            <li key={`${n.at}-${i}`} className="rounded-xl bg-white px-4 py-3 ring-1 ring-line">
              <p className="text-[0.95rem] whitespace-pre-line text-ink">{n.text}</p>
              <p className="mt-1.5 text-xs text-ink-muted">
                {N.by(n.by)} · {formatDateTime(n.at)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">{N.empty}</p>
      )}
    </section>
  );
}
