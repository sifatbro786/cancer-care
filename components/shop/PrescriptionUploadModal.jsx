"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, FileText, Upload } from "lucide-react";
import { shopData } from "@/data/shopData";
import {
  checkFile,
  orderSchema,
  PRESCRIPTION_ACCEPT,
  requiresPrescription,
} from "@/lib/validation/order";
import { applyFieldErrors, submitForm } from "@/lib/client/submitForm";
import { formatBDT } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { Field, FormAlert, Honeypot, Input, Textarea } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

const kb = (bytes) => (bytes > 1024 * 1024 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`);

/** Inner form — mounted fresh each time the modal opens, so state never leaks between products. */
function OrderForm({ product, onDone }) {
  const M = shopData.modal;
  const fileInputId = useId();
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [formError, setFormError] = useState("");
  const [reference, setReference] = useState("");
  const rx = requiresPrescription(product?.slug);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(orderSchema),
    mode: "onTouched",
    defaultValues: { product: product?.slug ?? "", quantity: 1, name: "", phone: "", address: "", note: "", company: "" },
  });

  function pickFile(e) {
    const f = e.target.files?.[0] ?? null;
    const err = f ? checkFile(f) : null;
    setFileError(err ?? "");
    setFile(err ? null : f);
    if (err) e.target.value = "";
  }

  async function onSubmit(values) {
    setFormError("");
    if (rx || file) {
      const err = checkFile(file);
      if (err) {
        setFileError(err);
        document.getElementById(fileInputId)?.focus();
        return;
      }
    }
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => v !== undefined && fd.append(k, String(v)));
    if (file) fd.append("prescription", file);

    const res = await submitForm("/api/order", fd);
    if (res.ok) {
      setReference(res.data.reference);
      return;
    }
    setFormError(res.message);
    if (res.fieldErrors?.prescription) setFileError(res.fieldErrors.prescription[0]);
    applyFieldErrors(setError, res.fieldErrors);
  }

  if (reference) {
    return (
      <div role="status" className="py-4 text-center">
        <CircleCheck aria-hidden="true" className="mx-auto size-10 text-brand-600" />
        <p className="mt-4 text-2xl font-semibold">{M.success.title}</p>
        <p className="mt-2 text-ink-soft">{M.success.text}</p>
        <p className="mt-4 font-mono text-sm text-ink-muted">{reference}</p>
        <Button variant="secondary" className="mt-6" onClick={onDone}>
          {M.close}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-5">
      <Honeypot {...register("company")} />
      <input type="hidden" {...register("product")} />

      <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 ring-1 ring-line">
        <div>
          <p className="text-sm text-ink-muted">{M.fields.product.label}</p>
          <p className="font-semibold">{product?.name ?? M.generalProduct}</p>
        </div>
        {product ? <p className="font-display font-semibold">{formatBDT(product.price)}</p> : null}
      </div>

      {/* Prescription file */}
      <div>
        <p className="text-[0.95rem] font-semibold">
          {M.fields.prescription.label}
          {rx ? <span className="ml-0.5 text-alert-600" aria-hidden="true">*</span> : null}
        </p>
        <label
          className="mt-1.5 flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-line bg-white p-4 transition-colors hover:border-brand-300 has-[:focus-visible]:border-brand-500"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mist text-brand-700">
            {file ? <FileText aria-hidden="true" className="size-5" /> : <Upload aria-hidden="true" className="size-5" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">
              {file ? file.name : M.fields.prescription.choose}
            </span>
            <span className="block text-sm text-ink-muted">
              {file ? kb(file.size) : rx ? M.fields.prescription.requiredHint : M.fields.prescription.hint}
            </span>
          </span>
          {file ? <span className="text-sm font-semibold text-brand-700">{M.fields.prescription.change}</span> : null}
          <input
            id={fileInputId}
            type="file"
            accept={PRESCRIPTION_ACCEPT}
            onChange={pickFile}
            aria-invalid={fileError ? true : undefined}
            aria-label={M.fields.prescription.label}
            className="sr-only"
          />
        </label>
        <p className="mt-1.5 text-sm text-ink-muted">{M.fields.prescription.hint}</p>
        {fileError ? (
          <p role="alert" className="mt-1 text-sm font-medium text-alert-700">
            {fileError}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_7rem]">
        <Field label={M.fields.name.label} error={errors.name?.message} required>
          {(p) => <Input {...p} autoComplete="name" placeholder={M.fields.name.placeholder} {...register("name")} />}
        </Field>
        <Field label={M.fields.quantity.label} error={errors.quantity?.message} required>
          {(p) => <Input {...p} type="number" min={1} max={20} inputMode="numeric" {...register("quantity")} />}
        </Field>
      </div>
      <Field label={M.fields.phone.label} error={errors.phone?.message} required>
        {(p) => (
          <Input {...p} type="tel" inputMode="tel" autoComplete="tel" placeholder={M.fields.phone.placeholder} {...register("phone")} />
        )}
      </Field>
      <Field label={M.fields.address.label} error={errors.address?.message} required>
        {(p) => <Textarea {...p} rows={2} autoComplete="street-address" placeholder={M.fields.address.placeholder} {...register("address")} />}
      </Field>
      <Field label={M.fields.note.label} error={errors.note?.message}>
        {(p) => <Textarea {...p} rows={2} placeholder={M.fields.note.placeholder} {...register("note")} />}
      </Field>

      <FormAlert>{formError}</FormAlert>
      <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5">
        <Button variant="secondary" onClick={onDone}>
          {M.cancel}
        </Button>
        <Button type="submit" withArrow disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? M.submittingLabel : M.submitLabel}
        </Button>
      </div>
    </form>
  );
}

/**
 * Order / prescription upload modal.
 * `product` = a product object, or null for a general "upload my prescription" request.
 */
export default function PrescriptionUploadModal({ open, product, onClose }) {
  const M = shopData.modal;
  const rx = requiresPrescription(product?.slug);
  return (
    <Modal open={open} onClose={onClose} title={rx ? M.rxTitle : M.title} description={M.intro} closeLabel={M.close}>
      <OrderForm key={product?.slug ?? "general"} product={product} onDone={onClose} />
    </Modal>
  );
}
