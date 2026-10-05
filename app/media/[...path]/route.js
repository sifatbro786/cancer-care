import { readMediaFile } from "@/lib/server/media";

/**
 * GET /media/YYYY/MM/<uuid>.webp — public, admin-uploaded images.
 * File names are random UUIDs and never reused → safe to cache for a year as immutable.
 * On the VPS, let Nginx serve this folder directly (README) and this route becomes a fallback.
 */
const SEGMENTS = [/^\d{4}$/, /^(0[1-9]|1[0-2])$/, /^[0-9a-f-]{36}\.webp$/];

export async function GET(_request, { params }) {
  const { path: parts } = await params;
  if (!Array.isArray(parts) || parts.length !== 3 || !parts.every((p, i) => SEGMENTS[i].test(p))) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const body = await readMediaFile(parts.join("/"));
    return new Response(body, {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(body.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=60" } });
  }
}
