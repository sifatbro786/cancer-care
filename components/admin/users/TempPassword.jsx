"use client";

import { useState } from "react";
import { Check, Copy, KeyRound } from "lucide-react";
import { usersData } from "@/data/admin/usersData";

/** One-time display of a generated password. Nothing here is persisted client-side. */
export default function TempPassword({ name, password, onDone }) {
  const T = usersData.temp;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div role="status" className="rounded-[1.25rem] bg-mist p-5 ring-1 ring-brand-200">
      <p className="flex items-center gap-2 font-semibold text-brand-900">
        <KeyRound aria-hidden="true" className="size-4" />
        {T.heading(name)}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="rounded-lg bg-white px-3.5 py-2 font-mono text-lg tracking-wider text-ink ring-1 ring-line select-all">{password}</code>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-brand-800 ring-1 ring-line hover:ring-brand-300 focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
          {copied ? T.copied : T.copy}
        </button>
        {onDone ? (
          <button type="button" onClick={onDone} className="text-sm font-semibold text-ink-soft hover:text-brand-800">
            {T.done}
          </button>
        ) : null}
      </div>
      <p className="mt-3 text-sm text-ink-soft">{T.note}</p>
    </div>
  );
}
