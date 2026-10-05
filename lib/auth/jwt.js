import { jwtVerify, SignJWT } from "jose";
import { getSigningKey, JWT_AUDIENCE, JWT_ISSUER, SESSION_TTL_SECONDS } from "@/lib/auth/config";
import { ROLES } from "@/lib/auth/rbac";

/**
 * Session token = HS256 JWT. Payload is minimal: user id (sub) + role.
 * No PII (name/email) — those are read from the DB on each request.
 */
export async function signSession({ userId, role }) {
  const key = getSigningKey();
  if (!key) throw new Error("[auth] AUTH_SECRET not configured");
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(String(userId))
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key);
}

/** Returns { userId, role, iat, exp } or null. Never throws. */
export async function verifySession(token) {
  const key = getSigningKey();
  if (!key || typeof token !== "string" || token.length > 2048) return null;
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"], // pin the algorithm — no "none" / alg confusion
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      clockTolerance: 5,
    });
    if (!payload.sub || !ROLES.includes(payload.role)) return null;
    return { userId: payload.sub, role: payload.role, iat: payload.iat, exp: payload.exp };
  } catch {
    return null;
  }
}
