/**
 * Auth constants — shared by proxy.js (optimistic check) and the server session layer.
 * No Node-only or Next-request APIs here, so it is safe to import anywhere on the server.
 */

const isProd = process.env.NODE_ENV === "production";

/** `__Host-` prefix (prod/HTTPS only): cookie is bound to this exact host, path "/", Secure — can't be set by a subdomain. */
export const SESSION_COOKIE = isProd ? "__Host-cc_admin" : "cc_admin";

/** Absolute session lifetime. No sliding refresh: an admin re-logs in at most twice a working day. */
export const SESSION_TTL_SECONDS = 12 * 60 * 60;

export const JWT_ISSUER = "cancer-care";
export const JWT_AUDIENCE = "cancer-care-admin";

export const LOGIN_PATH = "/admin/login";
export const ADMIN_HOME = "/admin";

/** Lockout policy (per account, persisted in the DB so restarts don't reset it). */
export const LOCKOUT = Object.freeze({ maxFailures: 5, minutes: 15 });

export const cookieOptions = (maxAgeSeconds = SESSION_TTL_SECONDS) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: "lax", // lax, not strict: an emailed link to /admin/... must arrive logged-in
  path: "/",
  maxAge: maxAgeSeconds,
  priority: "high",
});

/**
 * Signing key from AUTH_SECRET (min 32 chars). Returns null if missing/weak so callers
 * can fail closed (proxy → treat as logged out; login → show a config error).
 */
let cachedKey;
export function getSigningKey() {
  if (cachedKey !== undefined) return cachedKey;
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    console.error("[auth] AUTH_SECRET is missing or shorter than 32 characters — admin login is disabled.");
    cachedKey = null;
  } else {
    cachedKey = new TextEncoder().encode(secret);
  }
  return cachedKey;
}

/** Only allow redirects back into the admin area (blocks open redirects like //evil.com or /\evil.com). */
export function safeAdminPath(value) {
  if (typeof value !== "string") return ADMIN_HOME;
  if (!value.startsWith("/admin") || value.startsWith(LOGIN_PATH)) return ADMIN_HOME;
  if (/[\\\s]|\/\//.test(value)) return ADMIN_HOME;
  return value;
}
