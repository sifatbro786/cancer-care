import { auditData } from "@/data/admin/auditData";
import { authData } from "@/data/admin/authData";
import { isDbConfigured } from "@/lib/db/connect";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/utils";
import { AUDIT_GROUPS, listAudit } from "@/services/admin/audit";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { InboxTabs, Pager } from "@/components/admin/inbox/bits";
import { FormAlert } from "@/components/ui/Field";

export const metadata = { title: auditData.meta.title };

const BASE = "/admin/audit";

/** meta → short readable text: { from: "new", to: "confirmed" } → "new → confirmed" */
function metaText(meta) {
  if (!meta || typeof meta !== "object") return "";
  if (meta.from !== undefined && meta.to !== undefined) return `${meta.from} → ${meta.to}`;
  if (Array.isArray(meta.fields)) return meta.fields.join(", ");
  return Object.entries(meta)
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join(" · ")
    .slice(0, 160);
}

export default async function AuditPage({ searchParams }) {
  await requireUser(PERMISSIONS.auditRead);
  const A = auditData;
  const header = <AdminPageHeader eyebrow={A.eyebrow} title={A.title} highlight={A.highlight} description={A.intro} />;

  if (!isDbConfigured()) {
    return (
      <>
        {header}
        <FormAlert tone="info">{authData.overview.dbOff}</FormAlert>
      </>
    );
  }

  const sp = await searchParams;
  const log = await listAudit({ page: sp.page, group: typeof sp.tab === "string" ? sp.tab : "all", q: sp.q });
  // Tab counts would cost a query each on a large collection — tabs here are filters only
  const tabs = AUDIT_GROUPS.map((key) => ({ key, label: A.groups[key], count: key === log.group ? log.total : "·" }));

  return (
    <>
      {header}
      <div className="flex flex-col gap-5">
        <InboxTabs base={BASE} tabs={tabs} active={log.group} label={A.title} />
        <form role="search" action={BASE} method="get" className="flex w-full max-w-md gap-2">
          <input type="hidden" name="tab" value={log.group} />
          <label htmlFor="audit-q" className="sr-only">
            {A.searchLabel}
          </label>
          <input
            id="audit-q"
            name="q"
            type="search"
            defaultValue={log.q}
            maxLength={80}
            placeholder={A.searchPlaceholder}
            className="h-11 flex-1 rounded-xl bg-white px-3.5 text-[0.95rem] ring-1 ring-line outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button type="submit" className="h-11 rounded-xl bg-white px-4 text-sm font-semibold text-brand-800 ring-1 ring-line hover:ring-brand-300">
            {A.searchButton}
          </button>
        </form>

        {log.items.length ? (
          <div className="overflow-x-auto rounded-[1.25rem] bg-white ring-1 ring-line">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="border-b border-line text-ink-muted">
                <tr>
                  {Object.values(A.columns).map((c) => (
                    <th key={c} scope="col" className="px-4 py-3 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {log.items.map((e) => (
                  <tr key={e.id} className="align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-ink-soft tabular-nums">{formatDateTime(e.at)}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-ink">{e.actor ?? A.system}</span>
                      {e.actorEmail && e.actor !== e.actorEmail ? <span className="block text-xs text-ink-muted">{e.actorEmail}</span> : null}
                    </td>
                    <td className={`px-4 py-3 ${e.action.endsWith("_failed") ? "font-semibold text-alert-700" : "text-ink"}`}>
                      {A.actions[e.action] ?? e.action}
                      {metaText(e.meta) ? <span className="block text-xs text-ink-muted">{metaText(e.meta)}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {e.target ?? "—"}
                      {e.targetType && e.target !== e.targetType ? <span className="block text-xs text-ink-muted">{e.targetType}</span> : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{e.ip ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-[1.25rem] bg-white px-6 py-12 text-center text-ink-muted ring-1 ring-line">{A.empty}</p>
        )}

        <Pager base={BASE} page={log.page} pages={log.pages} tab={log.group === "all" ? undefined : log.group} q={log.q || undefined} />
      </div>
    </>
  );
}
