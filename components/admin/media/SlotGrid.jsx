"use client";

import { useState, useTransition } from "react";
import { mediaData } from "@/data/admin/mediaData";
import { resetSlotAction, setSlotAction } from "@/app/(admin)/_actions/media";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import SmartImage from "@/components/ui/SmartImage";
import { FormAlert } from "@/components/ui/Field";

/**
 * Site image slots. One picker <Modal> for the whole grid (dialog ids stay unique).
 * Stock photo = Unsplash default from data/media.js; "Your upload" = SiteSettings override.
 */
export default function SlotGrid({ slots, library, disabled }) {
  const S = mediaData.slots;
  const P = mediaData.picker;
  const [picking, setPicking] = useState(null); // slot key
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  // Server Actions called directly; each one re-authorizes and refresh()es this page.
  const run = (action, fields, onOk) =>
    startTransition(async () => {
      const fd = new FormData();
      for (const [k, v] of Object.entries(fields)) fd.set(k, v);
      const res = await action({}, fd);
      setError(res.ok ? null : res.message);
      if (res.ok) onOk?.();
    });

  const choose = (key, mediaId) => run(setSlotAction, { key, mediaId }, () => setPicking(null));

  const reset = (key) => {
    if (window.confirm(S.resetConfirm)) run(resetSlotAction, { key });
  };

  const pickingLabel = picking ? S.labels[picking]?.label ?? picking : "";

  return (
    <>
      {!picking ? <FormAlert>{error}</FormAlert> : null}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {slots.map((slot) => {
          const meta = S.labels[slot.key] ?? { label: slot.key, usedOn: "" };
          const shown = slot.current ?? slot.default;
          const custom = Boolean(slot.current);
          return (
            <li key={slot.key} className="flex flex-col overflow-hidden rounded-[1.25rem] bg-white ring-1 ring-line">
              <div className="relative aspect-[4/3] bg-brand-50">
                <SmartImage src={shown.src} alt={shown.alt} fill sizes="(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 100vw" className="object-cover" />
                <span
                  className={cn(
                    "absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold",
                    custom ? "bg-brand-700 text-white" : "bg-white/90 text-ink-soft ring-1 ring-line"
                  )}
                >
                  {custom ? S.customBadge : S.defaultBadge}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <h3 className="font-semibold">{meta.label}</h3>
                <p className="text-sm text-ink-muted">
                  {S.usedOn}: {meta.usedOn}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setError(null);
                      setPicking(slot.key);
                    }}
                    className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50"
                  >
                    {S.replace}
                  </button>
                  {custom ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => reset(slot.key)}
                      className="rounded-lg px-3.5 py-2 text-sm font-semibold text-ink-soft ring-1 ring-line hover:text-brand-800 hover:ring-brand-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                    >
                      {S.reset}
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <Modal
        open={Boolean(picking)}
        onClose={() => setPicking(null)}
        title={P.title(pickingLabel)}
        description={P.intro}
        closeLabel={P.close}
        className="max-w-3xl"
      >
        <FormAlert>{error}</FormAlert>
        {library.length ? (
          <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {library.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => choose(picking, m.id)}
                  className="group block w-full overflow-hidden rounded-xl text-left ring-1 ring-line hover:ring-2 hover:ring-brand-500 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-60"
                >
                  <span className="relative block aspect-[4/3] bg-brand-50">
                    <SmartImage src={m.url} alt={m.alt} fill sizes="14rem" className="object-cover" />
                  </span>
                  <span className="block truncate px-2.5 py-2 text-xs text-ink-soft group-hover:text-brand-800">
                    {P.choose}
                    <span className="sr-only">: {m.alt || m.originalName}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-soft">{P.empty}</p>
        )}
      </Modal>
    </>
  );
}
