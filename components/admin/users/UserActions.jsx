"use client";

import { useActionState, useState } from "react";
import { usersData } from "@/data/admin/usersData";
import { authData } from "@/data/admin/authData";
import { userOpAction } from "@/app/(admin)/_actions/users";
import { FormAlert } from "@/components/ui/Field";
import TempPassword from "@/components/admin/users/TempPassword";

const L = usersData.list;
const btn =
  "rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-ink-soft ring-1 ring-line hover:text-brand-800 hover:ring-brand-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50";

/** Row actions. Each button posts the same action with a different `op` — works without JS too. */
export default function UserActions({ user }) {
  const [state, formAction, pending] = useActionState(userOpAction, {});
  const [dismissed, setDismissed] = useState(null);
  const confirmFor = { disable: L.disableConfirm(user.name), reset: L.resetConfirm(user.name) };

  const onSubmit = (e) => {
    const op = e.nativeEvent.submitter?.value;
    if (confirmFor[op] && !window.confirm(confirmFor[op])) e.preventDefault();
  };

  return (
    <div className="flex flex-col gap-3">
      <form action={formAction} onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={user.id} />
        <label htmlFor={`role-${user.id}`} className="sr-only">
          {L.changeRole}
        </label>
        <select
          id={`role-${user.id}`}
          name="role"
          defaultValue={user.role}
          className="h-9 rounded-lg bg-white px-2.5 text-sm ring-1 ring-line outline-none focus:ring-2 focus:ring-brand-500"
        >
          {Object.entries(authData.roles).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button type="submit" name="op" value="role" disabled={pending} className={btn}>
          {L.saveRole}
        </button>
        {user.active ? (
          <button type="submit" name="op" value="disable" disabled={pending} className={btn}>
            {L.disable}
          </button>
        ) : (
          <button type="submit" name="op" value="enable" disabled={pending} className={btn}>
            {L.enable}
          </button>
        )}
        <button type="submit" name="op" value="reset" disabled={pending} className={btn}>
          {L.reset}
        </button>
        {user.locked ? (
          <button type="submit" name="op" value="unlock" disabled={pending} className={btn}>
            {L.unlock}
          </button>
        ) : null}
      </form>
      <FormAlert>{state.ok === false ? state.message : null}</FormAlert>
      {state.ok && state.temp && dismissed !== state.at ? (
        <TempPassword name={state.temp.name} password={state.temp.password} onDone={() => setDismissed(state.at)} />
      ) : null}
    </div>
  );
}
