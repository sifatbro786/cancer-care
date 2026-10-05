import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { User } from "@/lib/db/models";
import { ADMIN_HOME, cookieOptions, LOGIN_PATH, SESSION_COOKIE } from "@/lib/auth/config";
import { signSession, verifySession } from "@/lib/auth/jwt";
import { can } from "@/lib/auth/rbac";

/**
 * Session = signed JWT cookie (stateless) + a DB check on every request (stateful bits):
 *   - user still exists and is active        → disabling an admin locks them out immediately
 *   - token issued after passwordChangedAt  → password change signs out every other device
 *   - role is read from the DB, not the token → demotion takes effect immediately
 * One indexed findById per admin request; memoised per request with React cache().
 */

export async function createSession(user) {
  const token = await signSession({ userId: user.id ?? user._id, role: user.role });
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions());
}

/** Expire with the SAME attributes it was set with — browsers ignore a __Host- deletion that lacks Secure/Path. */
export async function deleteSession() {
  (await cookies()).set(SESSION_COOKIE, "", cookieOptions(0));
}

export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session || !isDbConfigured() || !isValidObjectId(session.userId)) return null;

  await connectDB();
  const user = await User.findById(session.userId)
    .select("name email role active passwordChangedAt lastLoginAt")
    .lean();
  if (!user?.active) return null;
  if (user.passwordChangedAt && session.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) return null;

  // DTO — only what the UI needs; never the hash or lockout counters
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
  };
});

/**
 * For Server Components (layouts/pages). Not logged in → login page; missing permission → overview.
 * The proxy has already done a cheap JWT check; this is the authoritative one.
 */
export async function requireUser(permission) {
  const user = await getCurrentUser();
  if (!user) redirect(`${LOGIN_PATH}?reason=expired`);
  if (permission && !can(user.role, permission)) redirect(`${ADMIN_HOME}?denied=1`);
  return user;
}

/**
 * For Server Actions and Route Handlers — returns instead of redirecting so the caller
 * decides the response. Usage: const auth = await authorize(PERMISSIONS.inboxWrite); if (!auth.ok) …
 */
export async function authorize(permission) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, status: 401, user: null };
  if (permission && !can(user.role, permission)) return { ok: false, status: 403, user };
  return { ok: true, status: 200, user };
}

/** Route Handler wrapper: `export const GET = withAdmin(PERMISSIONS.inboxRead, async (req, ctx, user) => …)` */
export function withAdmin(permission, handler) {
  return async (request, context) => {
    const auth = await authorize(permission);
    if (!auth.ok) {
      return Response.json(
        { ok: false, message: auth.status === 401 ? "Not signed in." : "Not allowed." },
        { status: auth.status, headers: { "Cache-Control": "no-store" } }
      );
    }
    return handler(request, context, auth.user);
  };
}
