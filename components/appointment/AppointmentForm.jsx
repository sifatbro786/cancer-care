"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck, CircleCheck } from "lucide-react";
import { appointmentData as D } from "@/data/appointmentData";
import { appointmentSchema } from "@/lib/validation/appointment";
import { formatIsoDay, formatSlot, getBookableDays, getSlots, monthShort, weekdayShort } from "@/lib/schedule";
import { applyFieldErrors, submitForm } from "@/lib/client/submitForm";
import { IconByKey } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Field, FormAlert, Honeypot, Input, Select, Textarea } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

function StepTitle({ children }) {
  return <legend className="font-display text-xl font-semibold text-ink">{children}</legend>;
}

/** Radio rendered as a selectable tile — keyboard: arrows move within the group natively. */
function Tile({ name, value, register, checked, disabled, className, children }) {
  return (
    <label
      className={cn(
        "relative cursor-pointer rounded-2xl bg-white ring-1 ring-line transition-[box-shadow,background-color]",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500",
        checked && "bg-brand-50 ring-2 ring-brand-600",
        disabled && "cursor-not-allowed opacity-45",
        className,
      )}
    >
      <input type="radio" value={value} disabled={disabled} className="sr-only" {...register(name)} />
      {children}
    </label>
  );
}

export default function AppointmentForm({ services }) {
  const params = useSearchParams();
  // The page is prerendered at build time, so "today" on the server ≠ "today" in the browser.
  // Day/slot pickers render only after hydration → no mismatch.
  const hydrated = useHydrated();
  const [now] = useState(() => Date.now());
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState("");

  const initialType = params.get("type") === "online" ? "online" : "chamber";
  const initialService = services.some((s) => s.slug === params.get("service")) ? params.get("service") : "";
  const firstOpenDay = (t) =>
    getBookableDays(t, now).find((d) => !d.closed && getSlots(t, d.iso, now).length)?.iso ?? "";

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    mode: "onTouched",
    defaultValues: {
      type: initialType,
      service: initialService,
      date: firstOpenDay(initialType),
      slot: "",
      name: "",
      phone: "",
      email: "",
      age: "",
      visit: "new",
      message: "",
      consent: false,
      company: "",
    },
  });

  const [type, date, slot] = useWatch({ control, name: ["type", "date", "slot"] });
  const days = getBookableDays(type, now);
  const slots = date ? getSlots(type, date, now) : [];

  // Keep date/slot consistent when the consultation type changes
  const typeField = register("type", {
    onChange: (e) => {
      const t = e.target.value;
      const stillOpen = getBookableDays(t, now).some((d) => d.iso === date && !d.closed);
      if (!stillOpen) setValue("date", firstOpenDay(t));
      setValue("slot", "");
    },
  });
  const dateField = register("date", { onChange: () => setValue("slot", "") });

  async function onSubmit(values) {
    setFormError("");
    const res = await submitForm("/api/appointment", values);
    if (res.ok) {
      setResult({ ...values, reference: res.data.reference });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setFormError(res.message);
    applyFieldErrors(setError, res.fieldErrors);
  }

  if (result) {
    const S = D.success;
    const typeLabel = D.types.find((t) => t.key === result.type)?.title;
    return (
      <div role="status" className="rounded-[1.5rem] bg-white p-8 ring-1 ring-line sm:p-10">
        <CircleCheck aria-hidden="true" className="size-10 text-brand-600" />
        <h2 className="mt-5 text-3xl font-semibold">{S.title}</h2>
        <p className="mt-3 max-w-lg text-lg leading-relaxed text-ink-soft">{S.text}</p>
        <dl className="mt-8 divide-y divide-line border-y border-line">
          {[
            [S.refLabel, result.reference],
            [S.summaryLabels.type, typeLabel],
            [S.summaryLabels.date, formatIsoDay(result.date)],
            [S.summaryLabels.time, formatSlot(result.slot)],
            [S.summaryLabels.name, result.name],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 py-3">
              <dt className="text-sm font-semibold text-ink-muted">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <Button
          variant="secondary"
          className="mt-8"
          onClick={() => {
            reset();
            setResult(null);
          }}
        >
          {S.again}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-12">
      <Honeypot {...register("company")} />

      {/* 1 — type */}
      <fieldset className="min-w-0 space-y-4">
        <StepTitle>{D.steps.type}</StepTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {D.types.map((t) => (
            <Tile key={t.key} name="type" value={t.key} register={() => typeField} checked={type === t.key}>
              <span className="flex gap-4 p-5">
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-xl",
                    type === t.key ? "bg-brand-600 text-white" : "bg-mist text-brand-700",
                  )}
                >
                  <IconByKey name={t.icon} aria-hidden="true" className="size-5" />
                </span>
                <span>
                  <span className="block font-display text-lg font-semibold">{t.title}</span>
                  <span className="mt-0.5 block text-[0.95rem] leading-snug text-ink-soft">{t.text}</span>
                  <span className="mt-2 block text-sm font-medium text-brand-700">{t.meta}</span>
                </span>
              </span>
            </Tile>
          ))}
        </div>
        <div className="max-w-sm">
          <Field label={D.fields.service.label} error={errors.service?.message}>
            {(p) => (
              <Select {...p} {...register("service")}>
                <option value="">{D.fields.service.placeholder}</option>
                {services.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.title}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </fieldset>

      {/* 2 — day + time */}
      <fieldset className="min-w-0 space-y-5">
        <StepTitle>{D.steps.when}</StepTitle>

        {hydrated ? (
          <>
            <div
              role="radiogroup"
              aria-label={D.dateLabel}
              className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2"
            >
              {days.map((d) => (
                <Tile
                  key={d.iso}
                  name="date"
                  value={d.iso}
                  register={() => dateField}
                  checked={date === d.iso}
                  disabled={d.closed}
                  className="w-[4.6rem] shrink-0 snap-start text-center"
                >
                  <span className="block px-2 py-3">
                    <span className="block text-xs font-semibold tracking-wide text-ink-muted uppercase">
                      {d.isToday ? D.todayLabel : weekdayShort(d.weekday)}
                    </span>
                    <span className="mt-1 block font-display text-2xl leading-none font-semibold">{d.day}</span>
                    <span className="mt-1 block text-xs text-ink-muted">
                      {d.closed ? D.closedLabel : monthShort(d.month)}
                    </span>
                  </span>
                </Tile>
              ))}
            </div>
            {errors.date ? (
              <p role="alert" className="text-sm font-medium text-alert-700">
                {errors.date.message}
              </p>
            ) : null}

            <div>
              <p className="mb-3 flex items-center gap-2 text-[0.95rem] font-semibold">
                <CalendarCheck aria-hidden="true" className="size-4 text-brand-600" />
                {D.slotLabel}
                {date ? <span className="font-normal text-ink-muted">· {formatIsoDay(date)}</span> : null}
              </p>
              {slots.length ? (
                <div
                  role="radiogroup"
                  aria-label={D.slotLabel}
                  className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6"
                >
                  {slots.map((s) => (
                    <Tile
                      key={s}
                      name="slot"
                      value={s}
                      register={register}
                      checked={slot === s}
                      className="text-center"
                    >
                      <span className="block px-2 py-3 font-medium">{formatSlot(s)}</span>
                    </Tile>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl bg-white p-4 text-ink-soft ring-1 ring-line">{D.noSlotsLabel}</p>
              )}
              {errors.slot ? (
                <p role="alert" className="mt-2 text-sm font-medium text-alert-700">
                  {errors.slot.message}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <div aria-hidden="true" className="space-y-5">
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="h-[5.6rem] w-[4.6rem] shrink-0 animate-pulse rounded-2xl bg-white ring-1 ring-line"
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-2xl bg-white ring-1 ring-line" />
              ))}
            </div>
          </div>
        )}
      </fieldset>

      {/* 3 — details */}
      <fieldset className="min-w-0 space-y-5">
        <StepTitle>{D.steps.details}</StepTitle>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={D.fields.name.label} error={errors.name?.message} required className="sm:col-span-2">
            {(p) => <Input {...p} autoComplete="name" placeholder={D.fields.name.placeholder} {...register("name")} />}
          </Field>
          <Field label={D.fields.phone.label} hint={D.fields.phone.hint} error={errors.phone?.message} required>
            {(p) => (
              <Input
                {...p}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={D.fields.phone.placeholder}
                {...register("phone")}
              />
            )}
          </Field>
          <Field label={D.fields.email.label} error={errors.email?.message}>
            {(p) => (
              <Input
                {...p}
                type="email"
                autoComplete="email"
                placeholder={D.fields.email.placeholder}
                {...register("email")}
              />
            )}
          </Field>
          <Field label={D.fields.age.label} error={errors.age?.message}>
            {(p) => <Input {...p} inputMode="numeric" placeholder={D.fields.age.placeholder} {...register("age")} />}
          </Field>
          <fieldset>
            <legend className="text-[0.95rem] font-semibold">{D.fields.visit.label}</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {D.fields.visit.options.map((o) => (
                <label
                  key={o.value}
                  className="flex h-12 cursor-pointer items-center justify-center rounded-xl bg-white text-[0.95rem] font-medium ring-1 ring-line has-[:checked]:bg-brand-50 has-[:checked]:ring-2 has-[:checked]:ring-brand-600 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500"
                >
                  <input type="radio" value={o.value} className="sr-only" {...register("visit")} />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>
          <Field label={D.fields.message.label} error={errors.message?.message} className="sm:col-span-2">
            {(p) => <Textarea {...p} placeholder={D.fields.message.placeholder} {...register("message")} />}
          </Field>
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 size-5 shrink-0 accent-brand-600"
              aria-invalid={errors.consent ? true : undefined}
              {...register("consent")}
            />
            <span className="leading-relaxed">{D.fields.consent.label}</span>
          </label>
          {errors.consent ? (
            <p role="alert" className="mt-1.5 ml-8 text-sm font-medium text-alert-700">
              {errors.consent.message}
            </p>
          ) : null}
        </div>
      </fieldset>

      <div className="space-y-4">
        <FormAlert>{formError}</FormAlert>
        <Button type="submit" size="lg" withArrow disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? D.submittingLabel : D.submitLabel}
        </Button>
      </div>
    </form>
  );
}
