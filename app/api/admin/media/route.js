import { PERMISSIONS } from "@/lib/auth/rbac";
import { withAdmin } from "@/lib/auth/session";
import { MEDIA_MAX_BYTES } from "@/lib/server/media";
import { rateLimit } from "@/lib/server/rateLimit";
import { getClientIp, isSameOriginStrict } from "@/lib/server/request";
import { mediaData } from "@/data/admin/mediaData";
import { createMedia } from "@/services/admin/media";
import { audit } from "@/lib/server/audit";

const E = mediaData.errors;
const json = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * POST /api/admin/media — multipart { file, alt? } → { ok, item }.
 * A Route Handler (not a Server Action) so the 10 MB body limit applies here only —
 * raising the global Server Action limit would also widen the public login action.
 * Cookie-authenticated POST → explicit same-origin check (Route Handlers don't get
 * the automatic Origin check that Server Actions have).
 */
export const POST = withAdmin(PERMISSIONS.contentWrite, async (request, _ctx, user) => {
  if (!isSameOriginStrict(request)) return json({ ok: false, message: E.forbidden }, 403);

  const limit = rateLimit(`media-upload:${user.id}`, { limit: 60, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) return json({ ok: false, message: E.rateLimited }, 429);

  if (Number(request.headers.get("content-length") ?? 0) > MEDIA_MAX_BYTES + 64 * 1024) {
    return json({ ok: false, message: E.tooLarge }, 413);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, message: E.empty }, 400);
  }

  const alt = typeof form.get("alt") === "string" ? form.get("alt") : "";
  try {
    const result = await createMedia({ file: form.get("file"), alt, userId: user.id });
    if (!result.ok) return json({ ok: false, message: E[result.code] ?? E.server }, result.code === "tooLarge" ? 413 : 422);
    await audit({
      action: "media.upload",
      user,
      target: { type: "media", id: result.item.id, label: result.item.originalName || result.item.url },
      ip: getClientIp(request),
    });
    return json({ ok: true, item: result.item }, 201);
  } catch (err) {
    console.error("[media] upload failed:", err?.message);
    return json({ ok: false, message: E.server }, 500);
  }
});
