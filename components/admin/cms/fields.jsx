"use client";

import { useId } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, X } from "lucide-react";
import { cmsData } from "@/data/admin/cmsData";
import { cn } from "@/lib/utils";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import SmartImage from "@/components/ui/SmartImage";
import BlockEditor from "@/components/admin/cms/BlockEditor";
import { errorFor, moveItem } from "@/components/admin/cms/paths";
import { iconBtn, smallBtn } from "@/components/admin/cms/styles";

/**
 * One renderer per field type (see data/admin/cmsData.js for the list).
 * Controlled: `value` comes from the form state, `onChange(path, value)` writes back.
 * Numbers stay raw strings while typing — the server (zod) converts and range-checks.
 */

const H = cmsData.fieldHelp;
const I = cmsData.image;
const R = cmsData.repeater;

const isUpload = (src) => typeof src === "string" && src.startsWith("/media/");

function hintFor(field, { isNew }) {
  if (field.type === "slug") return field.lockOnEdit && !isNew ? H.slugLocked : isNew ? H.slugAuto : H.slugChange;
  if (field.hint) return field.hint;
  if (field.type === "lines") return H.lines;
  if (field.type === "paragraphs") return H.paragraphs;
  return undefined;
}

function optionsFor(field, options) {
  return typeof field.options === "string" ? (options?.[field.options] ?? []) : (field.options ?? []);
}

function CheckboxField({ field, value, onChange, error }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5 self-end">
      <label htmlFor={id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl bg-white px-4 ring-1 ring-line">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(field.name, e.target.checked)}
          className="size-5 accent-brand-600"
        />
        <span className="font-semibold text-ink">{field.label}</span>
      </label>
      {error ? <p className="text-sm font-medium text-alert-700">{error}</p> : null}
    </div>
  );
}

function ImageField({ field, value, onChange, onPick, error }) {
  const altId = useId();
  const src = value?.src;
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1.5 text-[0.95rem] font-semibold text-ink">{field.label}</legend>
      <div className="flex flex-col gap-4 rounded-xl bg-white p-4 ring-1 ring-line sm:flex-row sm:items-start">
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-brand-50 sm:w-56">
          {src ? (
            <SmartImage src={src} alt={value.alt ?? ""} fill sizes="14rem" className="object-cover" />
          ) : (
            <span className="grid h-full place-items-center text-sm text-ink-muted">{I.none}</span>
          )}
          {src ? (
            <span
              className={cn(
                "absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-semibold",
                isUpload(src) ? "bg-brand-700 text-white" : "bg-white/90 text-ink-soft ring-1 ring-line"
              )}
            >
              {isUpload(src) ? I.upload : I.stock}
            </span>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onPick(field.name)} className={smallBtn}>
              <ImagePlus aria-hidden="true" className="size-4" />
              {src ? I.change : I.choose}
            </button>
            {src ? (
              <button type="button" onClick={() => onChange(field.name, null)} className={smallBtn}>
                <X aria-hidden="true" className="size-4" />
                {I.remove}
              </button>
            ) : null}
          </div>
          {src ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor={altId} className="text-sm font-semibold text-ink">
                {I.alt}
              </label>
              <Input
                id={altId}
                value={value.alt ?? ""}
                maxLength={200}
                onChange={(e) => onChange(field.name, { ...value, alt: e.target.value })}
                className="h-10 text-[0.95rem]"
              />
              <p className="text-sm text-ink-muted">{I.altHint}</p>
            </div>
          ) : null}
          {error ? (
            <p role="alert" className="text-sm font-medium text-alert-700">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </fieldset>
  );
}

function Repeater({ field, value, onChange, errors, options }) {
  const items = Array.isArray(value) ? value : [];
  const max = field.maxItems ?? 20;
  const blank = Object.fromEntries(field.fields.map((f) => [f.name, f.type === "checkbox" ? false : ""]));
  const own = errors[field.name];

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1.5 text-[0.95rem] font-semibold text-ink">{field.label}</legend>
      {field.hint ? <p className="-mt-2 text-sm text-ink-muted">{field.hint}</p> : null}
      {items.length ? (
        <ol className="flex flex-col gap-3">
          {items.map((item, i) => (
            <li key={i} className="rounded-xl bg-white p-4 ring-1 ring-line">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-ink-muted">{R.item(field.noun, i)}</span>
                <div className="flex gap-1.5">
                  <button type="button" aria-label={cmsData.common.moveUp} disabled={i === 0} onClick={() => onChange(field.name, moveItem(items, i, -1))} className={iconBtn}>
                    <ArrowUp aria-hidden="true" className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={cmsData.common.moveDown}
                    disabled={i === items.length - 1}
                    onClick={() => onChange(field.name, moveItem(items, i, 1))}
                    className={iconBtn}
                  >
                    <ArrowDown aria-hidden="true" className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`${R.remove} — ${R.item(field.noun, i)}`}
                    onClick={() => onChange(field.name, items.filter((_, n) => n !== i))}
                    className={cn(iconBtn, "hover:text-alert-700")}
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </div>
              <div className={cn("grid gap-3", field.fields.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
                {field.fields.map((sub) => (
                  <FieldControl
                    key={sub.name}
                    field={{ ...sub, name: `${field.name}.${i}.${sub.name}` }}
                    value={item?.[sub.name]}
                    onChange={onChange}
                    errors={errors}
                    options={options}
                  />
                ))}
              </div>
            </li>
          ))}
        </ol>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={items.length >= max} onClick={() => onChange(field.name, [...items, blank])} className={smallBtn}>
          <Plus aria-hidden="true" className="size-4" />
          {R.add(field.noun)}
        </button>
        <span className="text-sm text-ink-muted">{R.max(max)}</span>
      </div>
      {own ? (
        <p role="alert" className="text-sm font-medium text-alert-700">
          {own}
        </p>
      ) : null}
    </fieldset>
  );
}

/**
 * @param field   field config (name = full dot path)
 * @param context { isNew, onPick } — slug lock state and the media picker opener
 */
export default function FieldControl({ field, value, onChange, errors, options, context = {} }) {
  const error = errorFor(errors, field.name);
  const set = (v) => onChange(field.name, v);

  switch (field.type) {
    case "checkbox":
      return <CheckboxField field={field} value={value} onChange={onChange} error={error} />;
    case "image":
      return <ImageField field={field} value={value} onChange={onChange} onPick={context.onPick} error={error} />;
    case "repeater":
      return <Repeater field={field} value={value} onChange={onChange} errors={errors} options={options} />;
    case "blocks":
      return <BlockEditor name={field.name} value={value} onChange={onChange} errors={errors} />;
    default:
      break;
  }

  const locked = field.type === "slug" && field.lockOnEdit && !context.isNew;

  return (
    <Field label={field.label} hint={hintFor(field, context)} error={error} required={field.required}>
      {(p) => {
        // `required` is enforced by the server; native validation would block saving drafts mid-edit
        const props = { ...p, required: undefined, "aria-required": field.required || undefined };
        switch (field.type) {
          case "textarea":
            return <Textarea {...props} rows={field.rows ?? 3} maxLength={field.max} value={value ?? ""} onChange={(e) => set(e.target.value)} />;
          case "lines":
            return (
              <Textarea
                {...props}
                rows={field.rows ?? Math.min(10, Math.max(3, (value?.length ?? 0) + 1))}
                value={(value ?? []).join("\n")}
                onChange={(e) => set(e.target.value.split("\n"))}
              />
            );
          case "paragraphs":
            return (
              <Textarea {...props} rows={field.rows ?? 8} value={(value ?? []).join("\n\n")} onChange={(e) => set(e.target.value.split("\n\n"))} />
            );
          case "select":
            return (
              <Select {...props} value={value === undefined || value === null ? "" : String(value)} onChange={(e) => set(e.target.value)}>
                <option value="" disabled>
                  —
                </option>
                {optionsFor(field, options).map((o) => (
                  <option key={String(o.value)} value={String(o.value)}>
                    {o.label}
                  </option>
                ))}
              </Select>
            );
          case "number":
            return (
              <Input
                {...props}
                type="number"
                inputMode="decimal"
                min={field.min}
                max={field.max}
                step={field.step ?? "any"}
                value={value ?? ""}
                onChange={(e) => set(e.target.value)}
              />
            );
          case "date":
            return <Input {...props} type="date" value={value ?? ""} onChange={(e) => set(e.target.value)} />;
          case "slug":
            return (
              <Input
                {...props}
                value={value ?? ""}
                readOnly={locked}
                maxLength={120}
                spellCheck={false}
                autoCapitalize="off"
                className={cn("font-mono text-[0.95rem]", locked && "bg-paper-deep text-ink-muted")}
                onChange={(e) => set(e.target.value)}
              />
            );
          default:
            return (
              <Input
                {...props}
                type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
                maxLength={field.max}
                value={value ?? ""}
                onChange={(e) => set(e.target.value)}
              />
            );
        }
      }}
    </Field>
  );
}
