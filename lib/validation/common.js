import { z } from "zod";
import { formMessages as M } from "@/data/formMessages";

/**
 * Shared field schemas — imported by BOTH the client (react-hook-form resolver)
 * and the Route Handlers, so validation rules can never drift apart.
 */

/** Trim, collapse whitespace, strip control chars (header-injection safe for email subjects). */
const clean = (s) => s.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();

export const nameField = z
  .string({ error: M.required })
  .transform(clean)
  .pipe(z.string().min(3, M.name).max(80, M.name));

/**
 * Bangladeshi mobile. Accepts 01712345678, +8801712345678, 8801712345678
 * (and the common +88 01712345678 typo). Spaces, dashes and brackets ignored.
 * Normalised to "01XXXXXXXXX" so the backend stores one canonical format.
 */
export const bdPhoneField = z
  .string({ error: M.required })
  .transform((s) => s.replace(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^(?:\+?880?)?0?1[3-9]\d{8}$/, M.phone))
  .transform((s) => `0${s.slice(-10)}`);

export const optionalEmailField = z
  .string()
  .trim()
  .max(120, M.email)
  .optional()
  .transform((v) => (v ? v : undefined))
  .pipe(z.email(M.email).optional());

/** Free text, multi-line allowed; trimmed and length-capped. */
export const messageField = (min = 0) =>
  z
    .string()
    .trim()
    .max(1000, M.message)
    .refine((v) => min === 0 || v.length >= min, M.messageMin);

/**
 * Honeypot — real users never see or fill it. Accept any value here; the
 * Route Handler checks it and silently "succeeds" so bots learn nothing.
 */
export const honeypotField = z.string().max(500).optional();
