import "server-only";
import { NextResponse } from "next/server";
import { formMessages as M } from "@/data/formMessages";

/**
 * Best-effort client IP. Behind Vercel / Nginx the proxy sets x-forwarded-for;
 * we take the first hop. Never use this for auth — only for rate-limit keys.
 */
export function getClientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * CSRF-style guard for cookie-less JSON/form endpoints: the browser always
 * sends Origin on cross-site POSTs, so reject any Origin that isn't ours.
 */
export function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin navigations / server-to-server
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

/** Uniform JSON responses — the client helper in lib/client/submitForm.js expects this shape. */
export const reply = {
  ok: (data = {}) => NextResponse.json({ ok: true, ...data }, { status: 200 }),
  invalid: (fieldErrors) =>
    NextResponse.json({ ok: false, message: M.server.invalid, fieldErrors }, { status: 422 }),
  forbidden: () => NextResponse.json({ ok: false, message: M.server.forbidden }, { status: 403 }),
  limited: (retryAfter) =>
    NextResponse.json(
      { ok: false, message: M.server.rateLimited },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    ),
  failed: () => NextResponse.json({ ok: false, message: M.server.failed }, { status: 502 }),
  tooLarge: (message) => NextResponse.json({ ok: false, message }, { status: 413 }),
};

/** Short human-friendly reference, e.g. CC-261006-7F3K (no ambiguous 0/O/1/I). */
export function makeReference(prefix = "CC") {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  const d = new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(2, 10).replaceAll("-", "");
  return `${prefix}-${d}-${code}`;
}
