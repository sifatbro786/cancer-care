"use client";

import { cmsData } from "@/data/admin/cmsData";
import Modal from "@/components/ui/Modal";
import SmartImage from "@/components/ui/SmartImage";
import { FormAlert } from "@/components/ui/Field";
import { smallBtn } from "@/components/admin/cms/styles";

/** Library picker for image fields. State (pages loaded) lives in EntityForm. */
export default function MediaPicker({ open, onClose, library, loading, onMore, onPick }) {
  const I = cmsData.image;
  const { items, page, pages, error } = library;

  return (
    <Modal open={open} onClose={onClose} title={I.pickerTitle} description={I.pickerIntro} closeLabel={I.close} className="max-w-3xl">
      <FormAlert>{error ? I.pickerError : null}</FormAlert>
      {items.length ? (
        <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onPick(m)}
                className="group block w-full overflow-hidden rounded-xl text-left ring-1 ring-line hover:ring-2 hover:ring-brand-500 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                <span className="relative block aspect-[4/3] bg-brand-50">
                  <SmartImage src={m.url} alt={m.alt} fill sizes="14rem" className="object-cover" />
                </span>
                <span className="block truncate px-2.5 py-2 text-xs text-ink-soft group-hover:text-brand-800">
                  {I.use}
                  <span className="sr-only">: {m.alt || m.originalName}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-soft">{loading ? I.pickerLoading : error ? null : I.pickerEmpty}</p>
      )}
      {items.length && page < pages ? (
        <button type="button" onClick={onMore} disabled={loading} className={`${smallBtn} mt-4`}>
          {loading ? I.pickerLoading : I.more}
        </button>
      ) : null}
    </Modal>
  );
}
