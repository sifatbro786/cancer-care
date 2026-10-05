"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, CircleX, LoaderCircle, Upload } from "lucide-react";
import { mediaData } from "@/data/admin/mediaData";
import { cn } from "@/lib/utils";

const ACCEPT = ".jpg,.jpeg,.png,.webp,.avif";
const MAX = 10 * 1024 * 1024;

/**
 * Multi-file uploader → POST /api/admin/media, one file at a time (keeps server memory flat
 * and gives per-file feedback). Client checks are only for fast feedback — the server re-checks
 * size + magic bytes and re-encodes everything.
 */
export default function MediaUploader() {
  const U = mediaData.upload;
  const E = mediaData.errors;
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef(null);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  const update = (i, patch) => setItems((list) => list.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  async function uploadAll(fileList) {
    const files = Array.from(fileList ?? []);
    if (!files.length || busy) return;
    const start = items.length;
    setItems((list) => [...list, ...files.map((f) => ({ name: f.name, status: "queued" }))]);
    setBusy(true);

    for (const [k, file] of files.entries()) {
      const i = start + k;
      if (file.size > MAX) {
        update(i, { status: "failed", message: E.tooLarge });
        continue;
      }
      update(i, { status: "uploading" });
      const body = new FormData();
      body.set("file", file);
      try {
        const res = await fetch("/api/admin/media", { method: "POST", body });
        const json = await res.json().catch(() => ({}));
        if (res.status === 401) {
          router.push("/admin/login?reason=expired");
          return;
        }
        update(i, res.ok && json.ok ? { status: "done" } : { status: "failed", message: json.message ?? E.server });
      } catch {
        update(i, { status: "failed", message: E.server });
      }
    }

    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh(); // re-render the server-side library list
  }

  return (
    <div className="flex flex-col gap-4">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          uploadAll(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-[1.25rem] border-2 border-dashed px-6 py-10 text-center transition-colors",
          "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-brand-500",
          over ? "border-brand-500 bg-brand-50" : "border-line bg-white hover:border-brand-300"
        )}
      >
        <Upload aria-hidden="true" className="size-7 text-brand-600" />
        <span className="font-display font-semibold text-brand-800">
          {U.button} <span className="font-sans font-normal text-ink-soft">{U.drop}</span>
        </span>
        <span className="text-sm text-ink-muted">{U.hint}</span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT}
          multiple
          disabled={busy}
          onChange={(e) => uploadAll(e.target.files)}
          className="sr-only"
        />
      </label>

      {items.length ? (
        <ul aria-live="polite" className="flex flex-col divide-y divide-line rounded-xl bg-white ring-1 ring-line">
          {items.map((it, i) => (
            <li key={`${it.name}-${i}`} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              {it.status === "done" ? (
                <CircleCheck aria-hidden="true" className="size-4 shrink-0 text-sage-700" />
              ) : it.status === "failed" ? (
                <CircleX aria-hidden="true" className="size-4 shrink-0 text-alert-600" />
              ) : (
                <LoaderCircle aria-hidden="true" className="size-4 shrink-0 animate-spin text-brand-600" />
              )}
              <span className="min-w-0 flex-1 truncate">{it.name}</span>
              <span className={cn("shrink-0", it.status === "failed" ? "text-alert-700" : "text-ink-muted")}>
                {it.status === "done" ? U.done : it.status === "failed" ? it.message : U.uploading}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
