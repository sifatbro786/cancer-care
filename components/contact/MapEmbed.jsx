"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

/**
 * Click-to-load Google Map. The iframe pulls ~600 KB of third-party JS,
 * so we only load it when the visitor asks (Lighthouse + data-saving on mobile).
 */
export default function MapEmbed({ src, title, label, note }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative min-h-72 flex-1 overflow-hidden rounded-[1.5rem] bg-mist ring-1 ring-line">
      {show ? (
        <iframe
          title={title}
          src={src}
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-white text-brand-700 ring-1 ring-line">
            <MapPin aria-hidden="true" className="size-6" />
          </span>
          <button
            type="button"
            onClick={() => setShow(true)}
            className="rounded-xl bg-white px-5 py-3 font-display font-semibold text-brand-800 ring-1 ring-line hover:ring-brand-300"
          >
            {label}
          </button>
          <p className="max-w-xs text-sm text-ink-muted">{note}</p>
        </div>
      )}
    </div>
  );
}
