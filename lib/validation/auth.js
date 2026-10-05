import { z } from "zod";
import { authData } from "@/data/admin/authData";

const E = authData.errors;

/** bcrypt reads only 72 bytes — measure bytes, not characters (Bangla chars are 3 bytes each). */
const byteLength = (s) => new TextEncoder().encode(s).length;

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX_BYTES = 72;

export const emailField = z
  .string({ error: E.required })
  .trim()
  .toLowerCase()
  .min(1, E.required)
  .max(120, E.email)
  .pipe(z.email(E.email));

/** New-password policy (NIST 800-63B style: length over composition rules). */
export const newPasswordField = z
  .string({ error: E.required })
  .min(PASSWORD_MIN, E.passwordShort)
  .refine((v) => byteLength(v) <= PASSWORD_MAX_BYTES, E.passwordLong);

/** Login: no policy check (old passwords must still work) — only sane bounds. */
export const loginSchema = z.object({
  email: emailField,
  password: z.string({ error: E.required }).min(1, E.required).max(200, E.invalid),
});

export const changePasswordSchema = z
  .object({
    current: z.string({ error: E.required }).min(1, E.required).max(200, E.currentWrong),
    next: newPasswordField,
    confirm: z.string({ error: E.required }).min(1, E.required),
  })
  .superRefine((v, ctx) => {
    if (v.next !== v.confirm) ctx.addIssue({ code: "custom", path: ["confirm"], message: E.passwordMismatch });
    if (v.next === v.current) ctx.addIssue({ code: "custom", path: ["next"], message: E.passwordSame });
  });
