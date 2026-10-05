import { NextResponse } from "next/server";
import { LOGIN_PATH, SESSION_COOKIE } from "@/lib/auth/config";
import { verifySession } from "@/lib/auth/jwt";
import { slugExists } from "@/lib/server/slugIndex";

/**
 * Proxy (Next 16 — formerly middleware). Runs before rendering, on the matched paths only.
 *
 * 1. /admin/**      optimistic auth: no valid session JWT → redirect to login (?next=…).
 *                   This is a fast UX gate, NOT the security boundary: the admin layout and
 *                   every Server Action / Route Handler re-verify against the DB.
 * 2. /api/admin/**  same check, JSON 401 instead of a redirect.
 * 3. /shop/:slug, /blog/:slug  unknown slug → real 404 status (see lib/server/slugIndex.js).
 */
export async function proxy(request) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
    if (!session) return Response.json({ ok: false, message: "Not signed in." }, { status: 401 });
    return NextResponse.next();
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // The login page decides itself (with a DB check) whether you're already signed in —
    // redirecting here on a merely *valid-looking* token could loop on a revoked session.
    if (pathname === LOGIN_PATH) return NextResponse.next();

    const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      const url = new URL(LOGIN_PATH, request.url);
      url.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const m = pathname.match(/^\/(shop|blog)\/([^/]+)\/?$/);
  if (m) {
    let slug;
    try {
      slug = decodeURIComponent(m[2]);
    } catch {
      slug = "";
    }
    if (!(await slugExists(m[1], slug))) {
      // Rewrite to a route that doesn't exist → root not-found UI with a real 404 status
      return NextResponse.rewrite(new URL("/__not-found", request.url), { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*", "/shop/:slug", "/blog/:slug"],
};
