"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authData } from "@/data/admin/authData";
import { LOGIN_PATH, safeAdminPath } from "@/lib/auth/config";
import { authorize, createSession, deleteSession } from "@/lib/auth/session";
import { changePasswordSchema, loginSchema } from "@/lib/validation/auth";
import { getClientIp } from "@/lib/server/request";
import { attemptLogin, changePassword } from "@/services/auth";

/**
 * Auth Server Actions. Next already enforces POST + Origin === Host on every action (CSRF);
 * each action still re-checks the session itself — page-level checks don't cover actions.
 * Return values carry only what the form needs (never user records or the password).
 */

const E = authData.errors;

export async function loginAction(_prev, formData) {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  const email = typeof formData.get("email") === "string" ? String(formData.get("email")).slice(0, 120) : "";
  if (!parsed.success) return { error: E.invalid, fieldErrors: z.flattenError(parsed.error).fieldErrors, email };

  let result;
  try {
    result = await attemptLogin({ ...parsed.data, ip: getClientIp({ headers: await headers() }) });
  } catch (err) {
    console.error("[auth] login error:", err?.message);
    return { error: E.server, email };
  }

  if (!result.ok) {
    const message =
      result.code === "locked" ? E.locked(result.minutes)
      : result.code === "rateLimited" ? E.rateLimited
      : result.code === "config" ? E.config
      : E.invalid;
    return { error: message, email };
  }

  await createSession(result.user);
  redirect(safeAdminPath(formData.get("next"))); // throws — must stay outside try/catch
}

export async function logoutAction() {
  await deleteSession();
  redirect(LOGIN_PATH);
}

export async function changePasswordAction(_prev, formData) {
  const auth = await authorize();
  if (!auth.ok) redirect(`${LOGIN_PATH}?reason=expired`);

  const parsed = changePasswordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };

  let result;
  try {
    result = await changePassword({ userId: auth.user.id, current: parsed.data.current, next: parsed.data.next });
  } catch (err) {
    console.error("[auth] change-password error:", err?.message);
    return { ok: false, error: E.server };
  }

  if (!result.ok) {
    if (result.code === "currentWrong") return { ok: false, fieldErrors: { current: [E.currentWrong] } };
    if (result.code === "rateLimited") return { ok: false, error: E.rateLimited };
    redirect(`${LOGIN_PATH}?reason=expired`);
  }

  // Older tokens are now invalid (passwordChangedAt) — re-issue one for THIS device
  await createSession(auth.user);
  return { ok: true, message: authData.account.success };
}
