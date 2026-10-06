"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash } from "lucide-react";
import { cmsData } from "@/data/admin/cmsData";
import { deleteEntityAction, listMediaAction, saveEntityAction } from "@/app/(admin)/_actions/cms";
import { cn, slugify } from "@/lib/utils";
import { FormAlert } from "@/components/ui/Field";
import FieldControl from "@/components/admin/cms/fields";
import MediaPicker from "@/components/admin/cms/MediaPicker";
import { getAt, setAt } from "@/components/admin/cms/paths";
import { smallBtn } from "@/components/admin/cms/styles";

/**
 * Generic content editor, driven by data/admin/cmsData.js.
 * - Client state is the whole record; the Server Action re-validates everything (zod).
 * - `version` (updatedAt) travels with every save → stale tabs get a conflict, not an overwrite.
 * - New records: slug follows the title until the admin edits it by hand.
 * - Unsaved changes: sticky bar + browser leave warning.
 */
export default function EntityForm({ entity, id, version: loadedVersion, initialValues, options, created = false }) {
  const cfg = cmsData.entities[entity];
  const C = cmsData.common;
  const router = useRouter();
  const isNew = !cfg.singleton && !id;
  const fields = cfg.sections.flatMap((s) => s.fields);
  const slugFields = fields.filter((f) => f.type === "slug");

  const [values, setValues] = useState(initialValues);
  const [version, setVersion] = useState(loadedVersion ?? "");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(created ? { tone: "info", text: C.created } : null);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState({});
  const [pending, startTransition] = useTransition();
  const alertRef = useRef(null);

  // media picker: library is loaded on first open and kept for the session
  const [pickerFor, setPickerFor] = useState(null);
  const [library, setLibrary] = useState({ items: [], page: 0, pages: 1, error: null });
  const [loadingLibrary, startLibrary] = useTransition();

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const focusAlert = () => requestAnimationFrame(() => alertRef.current?.focus());

  const update = (path, value) => {
    const manualSlug = slugFields.some((f) => f.name === path);
    if (manualSlug) setSlugTouched((t) => ({ ...t, [path]: true }));
    setValues((prev) => {
      let next = setAt(prev, path, value);
      if (isNew) {
        for (const f of slugFields) {
          if (f.from === path && !slugTouched[f.name]) next = setAt(next, f.name, slugify(String(value ?? "")).slice(0, 120));
        }
      }
      return next;
    });
    setDirty(true);
    setErrors((prev) => {
      if (!Object.keys(prev).some((k) => k === path || k.startsWith(`${path}.`))) return prev;
      return Object.fromEntries(Object.entries(prev).filter(([k]) => k !== path && !k.startsWith(`${path}.`)));
    });
  };

  const loadLibrary = (page) =>
    startLibrary(async () => {
      const res = await listMediaAction(page);
      setLibrary((prev) =>
        res.ok
          ? { items: page === 1 ? res.items : [...prev.items, ...res.items], page: res.page, pages: res.pages, error: null }
          : { ...prev, error: res.message }
      );
    });

  const openPicker = (path) => {
    setPickerFor(path);
    if (library.page === 0 || library.error) loadLibrary(1);
  };

  const pick = (m) => {
    const current = getAt(values, pickerFor);
    update(pickerFor, { src: m.url, alt: m.alt || current?.alt || "" });
    setPickerFor(null);
  };

  const submit = (e) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveEntityAction(entity, isNew ? null : id, version, values);
      if (res.ok) {
        setErrors({});
        setDirty(false);
        if (isNew) {
          router.replace(`/admin/content/${entity}/${res.id}?created=1`);
          return;
        }
        setVersion(res.version);
        setStatus({ tone: "info", text: C.saved });
      } else {
        setErrors(res.fieldErrors ?? {});
        setStatus({ tone: "error", text: res.message });
      }
      focusAlert();
    });
  };

  const remove = () => {
    if (!window.confirm(C.deleteConfirm(cfg.noun))) return;
    startTransition(async () => {
      const res = await deleteEntityAction(entity, id);
      if (res.ok) {
        setDirty(false);
        router.push(`/admin/content/${entity}`);
        return;
      }
      setStatus({ tone: "error", text: res.message });
      focusAlert();
    });
  };

  const alert = status ? (
    <div ref={alertRef} tabIndex={-1} className="outline-none">
      <FormAlert tone={status.tone}>{status.text}</FormAlert>
    </div>
  ) : null;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-10">
      {alert}

      {cfg.sections.map((section) => (
        <fieldset key={section.title} className="flex flex-col gap-5 border-t border-line pt-8 first-of-type:border-t-0 first-of-type:pt-0">
          <legend className="text-xl font-semibold">{section.title}</legend>
          {section.description ? <p className="-mt-2 text-ink-soft">{section.description}</p> : null}
          <div className="grid gap-5 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div
                key={field.name}
                className={cn(
                  "flex flex-col",
                  (field.width === "full" || ["repeater", "blocks", "image", "paragraphs"].includes(field.type)) && "sm:col-span-2"
                )}
              >
                <FieldControl
                  field={field}
                  value={getAt(values, field.name)}
                  onChange={update}
                  errors={errors}
                  options={options}
                  context={{ isNew, onPick: openPicker }}
                />
              </div>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        <p aria-live="polite" className="text-sm text-ink-muted">
          {dirty ? C.unsaved : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          {!isNew && !cfg.singleton && !cfg.noDelete ? (
            <button type="button" onClick={remove} disabled={pending} className={cn(smallBtn, "h-11 px-4 hover:text-alert-700 hover:ring-alert-600/40")}>
              <Trash aria-hidden="true" className="size-4" />
              {C.delete}
            </button>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 font-display text-[0.95rem] font-semibold text-white hover:bg-brand-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-500 disabled:opacity-60"
          >
            <Save aria-hidden="true" className="size-4" />
            {pending ? C.saving : isNew ? C.create : C.save}
          </button>
        </div>
      </div>

      <MediaPicker
        open={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        library={library}
        loading={loadingLibrary}
        onMore={() => loadLibrary(library.page + 1)}
        onPick={pick}
      />
    </form>
  );
}
