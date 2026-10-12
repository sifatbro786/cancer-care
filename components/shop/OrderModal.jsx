"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, LoaderCircle, TriangleAlert } from "lucide-react";
import { shopData } from "@/data/shopData";
import { ONLINE_METHODS, orderSchema } from "@/lib/validation/order";
import { applyFieldErrors, submitForm } from "@/lib/client/submitForm";
import { cn, formatBDT } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { Field, FormAlert, Honeypot, Input, Textarea } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

const isOnline = (m) => ONLINE_METHODS.includes(m);

/** Inner form — mounted fresh each time the modal opens, so state never leaks between products. */
function OrderForm({ product, paymentMethods, onDone }) {
  const M = shopData.modal;
  const P = shopData.payment;
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState(null); // { reference, paymentFailed? } | { redirecting: label }

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(orderSchema),
    mode: "onTouched",
    defaultValues: {
      product: product.slug,
      quantity: 1,
      name: "",
      phone: "",
      address: "",
      note: "",
      paymentMethod: paymentMethods[0] ?? "offline",
      company: "",
    },
  });
  const [quantity, method] = useWatch({ control, name: ["quantity", "paymentMethod"] });
  const qty = Math.min(20, Math.max(1, Math.floor(Number(quantity)) || 1));
  const methodLabel = P.methods[method]?.label ?? "";

  async function onSubmit(values) {
    setFormError("");
    const res = await submitForm("/api/order", values);
    if (!res.ok) {
      setFormError(res.message);
      applyFieldErrors(setError, res.fieldErrors);
      return;
    }
    if (res.data.redirectUrl) {
      setDone({ redirecting: methodLabel });
      window.location.assign(res.data.redirectUrl);
      return;
    }
    setDone({ reference: res.data.reference, paymentFailed: Boolean(res.data.paymentFailed) });
  }

  if (done?.redirecting) {
    return (
      <div role="status" className="py-8 text-center">
        <LoaderCircle aria-hidden="true" className="mx-auto size-9 animate-spin text-brand-600" />
        <p className="mt-4 text-lg font-semibold">{M.redirecting(done.redirecting)}</p>
      </div>
    );
  }

  if (done) {
    const S = done.paymentFailed ? M.paymentFailed : M.success;
    const Icon = done.paymentFailed ? TriangleAlert : CircleCheck;
    return (
      <div role="status" className="py-4 text-center">
        <Icon aria-hidden="true" className={cn("mx-auto size-10", done.paymentFailed ? "text-alert-600" : "text-brand-600")} />
        <p className="mt-4 text-2xl font-semibold">{S.title}</p>
        <p className="mx-auto mt-2 max-w-sm text-ink-soft">{S.text}</p>
        <p className="mt-4 font-mono text-sm text-ink-muted">{done.reference}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {done.paymentFailed ? <Button href={`/payment?ref=${done.reference}`}>{M.paymentFailed.cta}</Button> : null}
          <Button variant="secondary" onClick={onDone}>
            {M.close}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-5">
      <Honeypot {...register("company")} />
      <input type="hidden" {...register("product")} />

      <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 ring-1 ring-line">
        <div className="min-w-0">
          <p className="text-sm text-ink-muted">{M.fields.product.label}</p>
          <p className="truncate font-semibold">{product.name}</p>
        </div>
        <p className="shrink-0 font-display font-semibold">{formatBDT(product.price)}</p>
      </div>
      {errors.product ? (
        <p role="alert" className="text-sm font-medium text-alert-700">
          {errors.product.message}
        </p>
      ) : null}

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

      <fieldset aria-describedby={errors.paymentMethod ? "pay-error" : undefined}>
        <legend className="text-[0.95rem] font-semibold text-ink">{P.legend}</legend>
        <div className={cn("mt-1.5 grid gap-2", paymentMethods.length > 2 ? "sm:grid-cols-3" : paymentMethods.length === 2 && "sm:grid-cols-2")}>
          {paymentMethods.map((m) => (
            <label
              key={m}
              className="flex cursor-pointer flex-col gap-0.5 rounded-xl bg-white p-3.5 ring-1 ring-line transition-shadow has-[:checked]:bg-brand-50 has-[:checked]:ring-2 has-[:checked]:ring-brand-600 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500"
            >
              <input type="radio" value={m} className="sr-only" {...register("paymentMethod")} />
              <span className="font-semibold text-ink">{P.methods[m].label}</span>
              <span className="text-sm leading-snug text-ink-muted">{P.methods[m].text}</span>
            </label>
          ))}
        </div>
        {errors.paymentMethod ? (
          <p id="pay-error" role="alert" className="mt-1 text-sm font-medium text-alert-700">
            {errors.paymentMethod.message}
          </p>
        ) : null}
      </fieldset>

      <div className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
        <div>
          <p className="font-semibold">{M.total}</p>
          <p className="text-sm text-ink-muted">{M.totalHint}</p>
        </div>
        <p className="font-display text-2xl font-semibold tabular-nums" aria-live="polite">
          {formatBDT(product.price * qty)}
        </p>
      </div>

      <FormAlert>{formError}</FormAlert>
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="secondary" onClick={onDone}>
          {M.cancel}
        </Button>
        <Button type="submit" withArrow disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? M.submittingLabel : isOnline(method) ? M.submitLabel.online(methodLabel) : M.submitLabel.offline}
        </Button>
      </div>
    </form>
  );
}

/**
 * Order modal. `product` = the product to order (null = closed).
 * `paymentMethods` = methods enabled on the server (env keys present), in display order.
 */
export default function OrderModal({ open, product, paymentMethods = ["offline"], onClose }) {
  const M = shopData.modal;
  return (
    <Modal open={open && Boolean(product)} onClose={onClose} title={M.title} description={M.intro} closeLabel={M.close}>
      {product ? <OrderForm key={product.slug} product={product} paymentMethods={paymentMethods} onDone={onClose} /> : null}
    </Modal>
  );
}
