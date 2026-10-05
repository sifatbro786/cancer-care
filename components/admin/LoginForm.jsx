"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authData } from "@/data/admin/authData";
import { loginAction } from "@/app/(admin)/_actions/auth";
import { Field, FormAlert, Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

/**
 * Progressive enhancement: a plain <form action={serverAction}> — works before hydration.
 * React resets the form after the action; `defaultValue={state.email}` restores the email,
 * the password is intentionally cleared.
 */
export default function LoginForm({ next, notice }) {
  const L = authData.login;
  const [state, formAction, pending] = useActionState(loginAction, { email: "" });
  const [show, setShow] = useState(false);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <FormAlert tone="info">{!state.error ? notice : null}</FormAlert>
      <FormAlert>{state.error}</FormAlert>
      <input type="hidden" name="next" value={next ?? ""} />

      <Field label={L.email} error={fe.email?.[0]} required>
        {(p) => (
          <Input
            {...p}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            defaultValue={state.email}
          />
        )}
      </Field>

      <Field label={L.password} error={fe.password?.[0]} required>
        {(p) => (
          <div className="relative">
            <Input
              {...p}
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? L.hidePassword : L.showPassword}
              aria-pressed={show}
              className="absolute inset-y-0 right-1 my-auto grid size-10 place-items-center rounded-lg text-ink-muted hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-brand-500"
            >
              {show ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
            </button>
          </div>
        )}
      </Field>

      <Button type="submit" size="lg" disabled={pending} aria-disabled={pending} className="mt-1 w-full">
        {pending ? L.submitting : L.submit}
      </Button>
    </form>
  );
}
