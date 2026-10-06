import { z } from "zod";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { withAdmin } from "@/lib/auth/session";
import { audit } from "@/lib/server/audit";
import { toCsv } from "@/lib/server/csv";
import { getClientIp, isSameSiteRequest } from "@/lib/server/request";
import { EXPORT_KINDS, exportRows } from "@/services/admin/exports";

/**
 * GET /api/admin/export/:kind?tab=&from=YYYY-MM-DD&to=YYYY-MM-DD → CSV download.
 * inbox:read only; refused when the browser says the request came from another site
 * (Sec-Fetch-Site) so a third-party page can't trigger downloads with the staff cookie.
 * Every export is written to the audit log (patient data leaving the system).
 */
const day = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).default("");
const params = z.object({ tab: z.string().max(20).default("all"), from: day, to: day });
const noStore = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

export const GET = withAdmin(PERMISSIONS.inboxRead, async (request, { params: route }, user) => {
  const { kind } = await route;
  if (!EXPORT_KINDS.includes(kind)) return new Response("Not found", { status: 404, headers: noStore });
  if (!isSameSiteRequest(request)) return new Response("Forbidden", { status: 403, headers: noStore });

  const sp = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = params.safeParse({ tab: sp.tab ?? "all", from: sp.from ?? "", to: sp.to ?? "" });
  if (!parsed.success) return new Response("Bad request", { status: 400, headers: noStore });

  let data;
  try {
    data = await exportRows(kind, parsed.data);
  } catch (err) {
    console.error("[export] failed:", err?.message);
    return new Response("Export failed", { status: 500, headers: noStore });
  }

  await audit({
    action: "inbox.export",
    user,
    target: { type: kind, label: `${data.rows.length} rows` },
    meta: { ...parsed.data, truncated: data.truncated },
    ip: getClientIp(request),
  });

  const stamp = new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 10);
  return new Response(toCsv(data.header, data.rows), {
    headers: {
      ...noStore,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${kind}-${stamp}.csv"`,
      ...(data.truncated ? { "X-Export-Truncated": "true" } : {}),
    },
  });
});
