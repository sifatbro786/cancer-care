"use client";

import { useId } from "react";
import { ArrowDown, ArrowUp, Heading2, Info, List, Pilcrow, X } from "lucide-react";
import { cmsData } from "@/data/admin/cmsData";
import { cn } from "@/lib/utils";
import { Input, Textarea } from "@/components/ui/Field";
import { iconBtn, smallBtn } from "@/components/admin/cms/styles";
import { moveItem } from "@/components/admin/cms/paths";

/**
 * Article body editor — the same typed blocks ArticleBody renders
 * (paragraph | heading | list | callout). No HTML is ever stored, so there is
 * nothing to sanitise and no XSS surface.
 */

const T = cmsData.blocks;
const TYPES = [
  { type: "paragraph", icon: Pilcrow },
  { type: "heading", icon: Heading2 },
  { type: "list", icon: List },
  { type: "callout", icon: Info },
];
const blank = (type) => (type === "list" ? { type, items: [""] } : { type, text: "" });

function Block({ block, index, count, name, onChange, onMove, onRemove, error }) {
  const id = useId();
  const label = T.types[block.type] ?? block.type;
  const set = (patch) => onChange({ ...block, ...patch });

  return (
    <li className={cn("rounded-xl bg-white p-4 ring-1", error ? "ring-2 ring-alert-600" : "ring-line", block.type === "callout" && "bg-mist")}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold tracking-wide text-ink-muted uppercase">
          {label}
        </label>
        <div className="flex gap-1.5">
          <button type="button" aria-label={`${cmsData.common.moveUp} — ${label} ${index + 1}`} disabled={index === 0} onClick={() => onMove(-1)} className={iconBtn}>
            <ArrowUp aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            aria-label={`${cmsData.common.moveDown} — ${label} ${index + 1}`}
            disabled={index === count - 1}
            onClick={() => onMove(1)}
            className={iconBtn}
          >
            <ArrowDown aria-hidden="true" className="size-4" />
          </button>
          <button type="button" aria-label={`${T.remove} — ${label} ${index + 1}`} onClick={onRemove} className={cn(iconBtn, "hover:text-alert-700")}>
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>

      {block.type === "heading" ? (
        <Input id={id} name={`${name}.${index}`} value={block.text ?? ""} maxLength={200} onChange={(e) => set({ text: e.target.value })} className="font-display text-lg font-semibold" />
      ) : block.type === "list" ? (
        <Textarea
          id={id}
          rows={Math.min(10, Math.max(3, (block.items?.length ?? 0) + 1))}
          value={(block.items ?? []).join("\n")}
          onChange={(e) => set({ items: e.target.value.split("\n") })}
        />
      ) : (
        <Textarea
          id={id}
          rows={block.type === "callout" ? 3 : 5}
          maxLength={block.type === "callout" ? 1000 : 5000}
          value={block.text ?? ""}
          onChange={(e) => set({ text: e.target.value })}
        />
      )}

      {T.hints[block.type] ? <p className="mt-1.5 text-sm text-ink-muted">{T.hints[block.type]}</p> : null}
      {error ? (
        <p role="alert" className="mt-1.5 text-sm font-medium text-alert-700">
          {error}
        </p>
      ) : null}
    </li>
  );
}

export default function BlockEditor({ name, value, onChange, errors }) {
  const blocks = Array.isArray(value) ? value : [];
  const write = (next) => onChange(name, next);
  const blockError = (i) => {
    const prefix = `${name}.${i}`;
    const key = Object.keys(errors).find((k) => k === prefix || k.startsWith(`${prefix}.`));
    return key ? errors[key] : undefined;
  };

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="sr-only">{T.heading}</legend>
      <p className="text-ink-soft">{T.intro}</p>

      {blocks.length ? (
        <ol className="flex flex-col gap-3">
          {blocks.map((b, i) => (
            <Block
              key={i}
              block={b}
              index={i}
              count={blocks.length}
              name={name}
              error={blockError(i)}
              onChange={(nb) => write(blocks.map((x, n) => (n === i ? nb : x)))}
              onMove={(dir) => write(moveItem(blocks, i, dir))}
              onRemove={() => write(blocks.filter((_, n) => n !== i))}
            />
          ))}
        </ol>
      ) : (
        <p className="rounded-xl bg-white px-4 py-6 text-center text-ink-muted ring-1 ring-line">{T.empty}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-ink-muted">{T.add}:</span>
        {TYPES.map(({ type, icon: Icon }) => (
          <button key={type} type="button" onClick={() => write([...blocks, blank(type)])} className={smallBtn}>
            <Icon aria-hidden="true" className="size-4" />
            {T.types[type]}
          </button>
        ))}
      </div>

      {errors[name] ? (
        <p role="alert" className="text-sm font-medium text-alert-700">
          {errors[name]}
        </p>
      ) : null}
    </fieldset>
  );
}
