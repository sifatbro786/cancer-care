"use client";

import { useActionState } from "react";
import { authData } from "@/data/admin/authData";
import { changePasswordAction } from "@/app/(admin)/_actions/auth";
import { Field, FormAlert, Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function ChangePasswordForm({ email }) {
  const A = authData.account;
  const [state, formAction, pending] = useActionState(changePasswordAction, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} noValidate className="flex max-w-md flex-col gap-5">
      <FormAlert>{state.error}</FormAlert>
      <FormAlert tone="info">{state.ok ? state.message : null}</FormAlert>

      {/* Hidden username lets password managers update the right saved entry */}
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />

      <Field label={A.current} error={fe.current?.[0]} required>
        {(p) => <Input {...p} name="current" type="password" autoComplete="current-password" />}
      </Field>
      <Field label={A.next} hint={A.nextHint} error={fe.next?.[0]} required>
        {(p) => <Input {...p} name="next" type="password" autoComplete="new-password" />}
      </Field>
      <Field label={A.confirm} error={fe.confirm?.[0]} required>
        {(p) => <Input {...p} name="confirm" type="password" autoComplete="new-password" />}
      </Field>

      <Button type="submit" disabled={pending} aria-disabled={pending} className="self-start">
        {pending ? A.submitting : A.submit}
      </Button>
    </form>
  );
}
