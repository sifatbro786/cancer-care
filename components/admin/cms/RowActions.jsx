"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Trash } from "lucide-react";
import { cmsData } from "@/data/admin/cmsData";
import { deleteEntityAction, moveEntityAction, toggleEntityAction } from "@/app/(admin)/_actions/cms";
import { cn } from "@/lib/utils";
import { iconBtn, smallBtn } from "@/components/admin/cms/styles";

/**
 * Per-row quick actions on a content list. Each Server Action re-authorizes and
 * refresh()es the list, so the server state is always what's shown.
 */
export default function RowActions({ entity, id, title, toggle, canMove, isFirst, isLast, tab }) {
  const C = cmsData.common;
  const cfg = cmsData.entities[entity];
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  const run = (fn) =>
    startTransition(async () => {
      const res = await fn();
      setError(res.ok ? null : res.message);
    });

  const toggleCopy = cfg.toggle ? cmsData.toggles[cfg.toggle] : null;

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {canMove ? (
          <>
            <button
              type="button"
              aria-label={`${C.moveUp}: ${title}`}
              disabled={pending || isFirst}
              onClick={() => run(() => moveEntityAction(entity, id, -1, tab))}
              className={iconBtn}
            >
              <ArrowUp aria-hidden="true" className="size-4" />
            </button>
            <button
              type="button"
              aria-label={`${C.moveDown}: ${title}`}
              disabled={pending || isLast}
              onClick={() => run(() => moveEntityAction(entity, id, 1, tab))}
              className={iconBtn}
            >
              <ArrowDown aria-hidden="true" className="size-4" />
            </button>
          </>
        ) : null}
        {toggleCopy && typeof toggle === "boolean" ? (
          <button type="button" disabled={pending} onClick={() => run(() => toggleEntityAction(entity, id))} className={smallBtn}>
            {toggle ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
            {toggle ? toggleCopy.on : toggleCopy.off}
            <span className="sr-only">: {title}</span>
          </button>
        ) : null}
        <button
          type="button"
          aria-label={`${C.delete}: ${title}`}
          disabled={pending}
          onClick={() => {
            if (window.confirm(C.deleteConfirm(cfg.noun))) run(() => deleteEntityAction(entity, id));
          }}
          className={cn(iconBtn, "hover:text-alert-700")}
        >
          <Trash aria-hidden="true" className="size-4" />
        </button>
      </div>
      {error ? (
        <p role="alert" className="max-w-xs text-right text-sm font-medium text-alert-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
