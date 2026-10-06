import { inboxData } from "@/data/admin/inboxData";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { EmptyState, InboxTabs, Pager, SearchBox } from "@/components/admin/inbox/bits";
import { Download } from "lucide-react";
import { FormAlert } from "@/components/ui/Field";

/** Shared list frame: header → tabs → search → rows → pager. */
function ExportForm({ kind, tab }) {
  const C = inboxData.common;
  const input = "h-10 rounded-lg bg-white px-2.5 text-sm ring-1 ring-line outline-none focus:ring-2 focus:ring-brand-500";
  return (
    <details className="group rounded-xl bg-white ring-1 ring-line">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand-800 [&::-webkit-details-marker]:hidden">
        <Download aria-hidden="true" className="size-4" />
        {C.exportHeading}
      </summary>
      {/* Plain GET → the browser downloads the file; no JS needed */}
      <form action={`/api/admin/export/${kind}`} method="get" className="flex flex-wrap items-end gap-3 border-t border-line px-4 py-3">
        <input type="hidden" name="tab" value={tab} />
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          {C.exportFrom}
          <input type="date" name="from" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          {C.exportTo}
          <input type="date" name="to" className={input} />
        </label>
        <button type="submit" className="h-10 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">
          {C.exportButton}
        </button>
        <p className="w-full text-xs text-ink-muted">{C.exportHint}</p>
      </form>
    </details>
  );
}

export default function InboxLayout({ copy, base, tabKeys, data, tab, q, exportKind, children }) {
  const tabs = tabKeys.map((key) => ({ key, label: copy.tabs[key], count: data?.counts?.[key] ?? 0 }));
  return (
    <>
      <AdminPageHeader eyebrow={copy.eyebrow} title={copy.title} highlight={copy.highlight} description={copy.intro} />
      {!data ? (
        <FormAlert tone="info">{inboxData.common.dbOff}</FormAlert>
      ) : (
        <div className="flex flex-col gap-5">
          <InboxTabs base={base} tabs={tabs} active={tab} label={copy.title} />
          <SearchBox base={base} tab={tab} q={q} />
          {exportKind ? <ExportForm kind={exportKind} tab={tab} /> : null}
          {data.items.length ? <ul className="flex flex-col gap-2.5">{children}</ul> : <EmptyState q={q} />}
          <Pager base={base} page={data.page} pages={data.pages} tab={tab} q={q} />
        </div>
      )}
    </>
  );
}

/** Read the common list params safely from searchParams. */
export function listParams(sp, tabKeys, fallback) {
  return {
    tab: tabKeys.includes(sp.tab) ? sp.tab : fallback,
    q: typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "",
    page: typeof sp.page === "string" ? sp.page : "1",
  };
}

export const rowClass =
  "flex flex-col gap-3 rounded-[1.25rem] bg-white px-5 py-4 ring-1 ring-line transition-shadow hover:ring-brand-300 hover:shadow-soft " +
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:flex-row sm:items-center sm:gap-6";
