import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Accessible form primitives.
 * <Field> wires label ↔ control ↔ hint/error via ids and aria-describedby,
 * and marks the control aria-invalid when there is an error.
 * Usage: <Field label="Name" error={errors.name?.message}>{(p) => <Input {...p} {...register("name")} />}</Field>
 */
export function Field({ label, hint, error, required, className, children }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[0.95rem] font-semibold text-ink">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-alert-600">
            *
          </span>
        ) : null}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined, required })}
      {hint && !error ? (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-alert-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const control =
  "w-full rounded-xl bg-white px-4 text-base text-ink ring-1 ring-line placeholder:text-ink-muted/70 " +
  "transition-shadow outline-none focus:ring-2 focus:ring-brand-500 " +
  "aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-alert-600 disabled:opacity-60";

/* React 19: `ref` is a regular prop — no forwardRef needed (react-hook-form's register() passes it). */
export function Input({ className, ...props }) {
  return <input className={cn(control, "h-12", className)} {...props} />;
}

export function Textarea({ className, rows = 4, ...props }) {
  return <textarea rows={rows} className={cn(control, "py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(control, "h-12 pr-3", className)} {...props}>
      {children}
    </select>
  );
}

/** Visually hidden honeypot. Off-screen (not display:none) so naive bots still fill it. */
export function Honeypot(props) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Company
        <input type="text" tabIndex={-1} autoComplete="off" {...props} />
      </label>
    </div>
  );
}

/** Form-level status message (error or info). */
export function FormAlert({ tone = "error", children }) {
  if (!children) return null;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl px-4 py-3 text-[0.95rem]",
        tone === "error" ? "bg-alert-50 text-alert-700 ring-1 ring-alert-600/20" : "bg-mist text-brand-800"
      )}
    >
      {children}
    </p>
  );
}
