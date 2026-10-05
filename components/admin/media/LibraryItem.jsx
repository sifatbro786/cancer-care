"use client";

import { useActionState, useState } from "react";
import { Check, Link2, Trash2 } from "lucide-react";
import { mediaData } from "@/data/admin/mediaData";
import { deleteMediaAction, updateAltAction } from "@/app/(admin)/_actions/media";
import SmartImage from "@/components/ui/SmartImage";
import { FormAlert } from "@/components/ui/Field";

const kb = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** One library card: preview, alt-text editor, copy link, delete. */
export default function LibraryItem({ item }) {
  const L = mediaData.library;
  const [altState, altAction, altPending] = useActionState(updateAltAction, {});
  const [delState, delAction, delPending] = useActionState(deleteMediaAction, {});
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(new URL(item.url, window.location.origin).href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — nothing to do */
    }
  }

  return (
    <li className="flex flex-col overflow-hidden rounded-[1.25rem] bg-white ring-1 ring-line">
      <div className="relative aspect-[4/3] bg-brand-50">
        <SmartImage src={item.url} alt={item.alt} fill sizes="(min-width: 1280px) 16rem, (min-width: 640px) 30vw, 50vw" className="object-cover" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-xs text-ink-muted">
          <span className="block truncate font-semibold text-ink-soft">{item.originalName || item.url.split("/").pop()}</span>
          {item.width}×{item.height} · {kb(item.size)}
        </p>

        <form action={altAction} className="flex flex-col gap-1.5">
          <input type="hidden" name="id" value={item.id} />
          <label htmlFor={`alt-${item.id}`} className="text-sm font-semibold">
            {L.altLabel}
          </label>
          <div className="flex gap-2">
            <input
              id={`alt-${item.id}`}
              name="alt"
              defaultValue={item.alt}
              maxLength={200}
              aria-describedby={`alt-hint-${item.id}`}
              className="h-10 min-w-0 flex-1 rounded-lg bg-white px-3 text-sm ring-1 ring-line outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={altPending}
              className="inline-flex h-10 shrink-0 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-brand-800 ring-1 ring-line hover:ring-brand-300 focus-visible:outline-2 focus-visible:outline-brand-500"
            >
              {altState.ok && !altPending ? <Check aria-hidden="true" className="size-4" /> : null}
              {altState.ok && !altPending ? L.saved : L.save}
            </button>
          </div>
          <p id={`alt-hint-${item.id}`} className="sr-only">
            {L.altHint}
          </p>
        </form>

        <FormAlert>{altState.ok === false ? altState.message : delState.ok === false ? delState.message : null}</FormAlert>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-ink-soft hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <Link2 aria-hidden="true" className="size-4" />
            <span aria-live="polite">{copied ? L.copied : L.copy}</span>
          </button>

          <form
            action={delAction}
            onSubmit={(e) => {
              if (!window.confirm(L.deleteConfirm)) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              disabled={delPending}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-ink-soft hover:text-alert-700 focus-visible:outline-2 focus-visible:outline-brand-500"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              {L.delete}
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}
