"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Modal on the native <dialog> element + showModal():
 * the browser provides the focus trap, Escape-to-close, top-layer stacking
 * and an inert background — no portal or focus-trap library needed.
 * Controlled via `open`; `onClose` fires for Escape, backdrop click and the X button.
 */
export default function Modal({ open, onClose, title, description, closeLabel = "Close", className, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = overflow;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-desc" : undefined}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself, outside the panel) closes
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-[1.5rem] bg-paper p-0 text-ink shadow-2xl",
        "backdrop:bg-brand-950/50 backdrop:backdrop-blur-[2px]",
        "open:animate-[modal-in_220ms_cubic-bezier(0.22,1,0.36,1)]",
        className
      )}
    >
      <div className="flex max-h-[92dvh] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 pt-6 pb-4">
          <div>
            <h2 id="modal-title" className="text-2xl font-semibold">
              {title}
            </h2>
            {description ? (
              <p id="modal-desc" className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-soft">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-line hover:ring-brand-300"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-6">{open ? children : null}</div>
      </div>
    </dialog>
  );
}
