"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck } from "lucide-react";
import { contactData } from "@/data/contactData";
import { contactSchema } from "@/lib/validation/contact";
import { applyFieldErrors, submitForm } from "@/lib/client/submitForm";
import { Field, FormAlert, Honeypot, Input, Select, Textarea } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function ContactForm() {
  const F = contactData.form;
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: { name: "", phone: "", email: "", subject: "appointment", message: "", company: "" },
  });

  async function onSubmit(values) {
    setFormError("");
    const res = await submitForm("/api/contact", values);
    if (res.ok) {
      setSent(true);
      reset();
      return;
    }
    setFormError(res.message);
    applyFieldErrors(setError, res.fieldErrors);
  }

  if (sent) {
    return (
      <div role="status" className="py-6">
        <CircleCheck aria-hidden="true" className="size-9 text-brand-600" />
        <p className="mt-4 text-2xl font-semibold">{F.success.title}</p>
        <p className="mt-2 text-ink-soft">{F.success.text}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative grid gap-5 sm:grid-cols-2">
      <Honeypot {...register("company")} />
      <Field label={F.fields.name.label} error={errors.name?.message} required>
        {(p) => <Input {...p} autoComplete="name" placeholder={F.fields.name.placeholder} {...register("name")} />}
      </Field>
      <Field label={F.fields.phone.label} error={errors.phone?.message} required>
        {(p) => (
          <Input {...p} type="tel" inputMode="tel" autoComplete="tel" placeholder={F.fields.phone.placeholder} {...register("phone")} />
        )}
      </Field>
      <Field label={F.fields.email.label} error={errors.email?.message}>
        {(p) => <Input {...p} type="email" autoComplete="email" placeholder={F.fields.email.placeholder} {...register("email")} />}
      </Field>
      <Field label={F.fields.subject.label} error={errors.subject?.message}>
        {(p) => (
          <Select {...p} {...register("subject")}>
            {F.fields.subject.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label={F.fields.message.label} error={errors.message?.message} required className="sm:col-span-2">
        {(p) => <Textarea {...p} rows={5} placeholder={F.fields.message.placeholder} {...register("message")} />}
      </Field>

      <div className="space-y-4 sm:col-span-2">
        <FormAlert>{formError}</FormAlert>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" withArrow disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? F.submittingLabel : F.submitLabel}
          </Button>
          <p className="text-sm text-ink-muted">{F.privacy}</p>
        </div>
      </div>
    </form>
  );
}
