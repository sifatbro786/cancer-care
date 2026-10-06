"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { usersData } from "@/data/admin/usersData";
import { LOGIN_PATH } from "@/lib/auth/config";
import { PERMISSIONS, ROLES } from "@/lib/auth/rbac";
import { authorize } from "@/lib/auth/session";
import { audit } from "@/lib/server/audit";
import { emailField } from "@/lib/validation/auth";
import { createUser, resetPassword, setActive, setRole, unlockUser } from "@/services/admin/users";

/**
 * User management Server Actions — super admin only (users:manage), re-checked in each one.
 * Self-protection and "last super admin" rules live in the service, not here.
 * Temporary passwords are returned once to the caller and never logged or audited.
 */

const E = usersData.errors;
const objectId = z.string().regex(/^[a-f0-9]{24}$/);
const role = z.enum(ROLES);

async function guard() {
  const auth = await authorize(PERMISSIONS.usersManage);
  if (auth.status === 401) redirect(`${LOGIN_PATH}?reason=expired`);
  return auth.ok ? auth.user : null;
}

async function safely(fn) {
  try {
    return await fn();
  } catch (err) {
    console.error("[users action]", err?.message);
    return { ok: false, code: "server" };
  }
}

const fail = (code) => ({ ok: false, message: E[code] ?? E.server });
const field = (fd, k) => (typeof fd.get(k) === "string" ? fd.get(k) : undefined);
const target = (u) => ({ type: "user", id: u.id ?? u._id, label: `${u.name} <${u.email}>` });

const createSchema = z.object({
  name: z
    .string({ error: E.required })
    .transform((s) => s.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim())
    .pipe(z.string().min(2, E.name).max(80, E.name)),
  email: emailField,
  role,
});

export async function createUserAction(_prev, fd) {
  const actor = await guard();
  if (!actor) return fail("server");
  const parsed = createSchema.safeParse({ name: field(fd, "name"), email: field(fd, "email"), role: field(fd, "role") });
  if (!parsed.success) {
    return { ok: false, message: E.invalid, fieldErrors: z.flattenError(parsed.error).fieldErrors, values: { name: field(fd, "name"), email: field(fd, "email") } };
  }
  const res = await safely(() => createUser({ ...parsed.data, actorId: actor.id }));
  if (!res.ok) return { ...fail(res.code), values: parsed.data };
  await audit({ action: "user.create", user: actor, target: target(res.user), meta: { role: res.user.role } });
  refresh();
  return { ok: true, at: Date.now(), temp: { name: res.user.name, password: res.tempPassword } };
}

/** One entry point for the per-row buttons: op = enable | disable | role | reset | unlock */
export async function userOpAction(_prev, fd) {
  const actor = await guard();
  if (!actor) return fail("server");
  const parsed = z
    .object({ id: objectId, op: z.enum(["enable", "disable", "role", "reset", "unlock"]), role: role.optional() })
    .safeParse({ id: field(fd, "id"), op: field(fd, "op"), role: field(fd, "role") || undefined });
  if (!parsed.success) return fail("invalid");
  const { id, op } = parsed.data;
  const base = { id, actorId: actor.id };

  const res = await safely(() => {
    switch (op) {
      case "enable":
        return setActive({ ...base, active: true });
      case "disable":
        return setActive({ ...base, active: false });
      case "role":
        return parsed.data.role ? setRole({ ...base, role: parsed.data.role }) : { ok: false, code: "invalid" };
      case "reset":
        return resetPassword(base);
      default:
        return unlockUser(base);
    }
  });
  if (!res.ok) return fail(res.code);

  if (res.changed !== false) {
    const action = { enable: "user.enable", disable: "user.disable", role: "user.role", reset: "user.reset_password", unlock: "user.unlock" }[op];
    const meta = op === "role" ? { from: res.from, to: parsed.data.role } : undefined;
    await audit({ action, user: actor, target: target(res.user), meta });
  }
  refresh();
  return op === "reset" ? { ok: true, at: Date.now(), temp: { name: res.user.name, password: res.tempPassword } } : { ok: true, at: Date.now() };
}
