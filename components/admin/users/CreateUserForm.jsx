"use client";

import { useActionState, useState } from "react";
import { UserPlus } from "lucide-react";
import { usersData } from "@/data/admin/usersData";
import { authData } from "@/data/admin/authData";
import { createUserAction } from "@/app/(admin)/_actions/users";
import { Field, FormAlert, Input, Select } from "@/components/ui/Field";
import TempPassword from "@/components/admin/users/TempPassword";

export default function CreateUserForm() {
  const C = usersData.create;
  const [state, formAction, pending] = useActionState(createUserAction, {});
  const [dismissed, setDismissed] = useState(null);
  const err = (k) => state.fieldErrors?.[k]?.[0];
  const showTemp = state.ok && state.temp && dismissed !== state.at;

  return (
    <div className="flex flex-col gap-5">
      {showTemp ? <TempPassword name={state.temp.name} password={state.temp.password} onDone={() => setDismissed(state.at)} /> : null}
      <form key={state.at ?? "form"} action={formAction} className="grid gap-4 rounded-[1.25rem] bg-white p-5 ring-1 ring-line sm:grid-cols-[1fr_1fr_12rem_auto] sm:items-end">
        <Field label={C.name} error={err("name")} required>
          {(p) => <Input {...p} name="name" autoComplete="off" maxLength={80} defaultValue={state.ok ? "" : state.values?.name} />}
        </Field>
        <Field label={C.email} error={err("email")} required>
          {(p) => <Input {...p} name="email" type="email" autoComplete="off" maxLength={120} defaultValue={state.ok ? "" : state.values?.email} />}
        </Field>
        <Field label={C.role} error={err("role")} required>
          {(p) => (
            <Select {...p} name="role" defaultValue="admin">
              {Object.entries(authData.roles).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 font-display text-[0.95rem] font-semibold text-white hover:bg-brand-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-500 disabled:opacity-60"
        >
          <UserPlus aria-hidden="true" className="size-4" />
          {pending ? C.submitting : C.submit}
        </button>
      </form>
      <FormAlert>{state.ok === false ? state.message : null}</FormAlert>
    </div>
  );
}
