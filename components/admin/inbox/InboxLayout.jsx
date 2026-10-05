import { inboxData } from "@/data/admin/inboxData";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { EmptyState, InboxTabs, Pager, SearchBox } from "@/components/admin/inbox/bits";
import { FormAlert } from "@/components/ui/Field";

/** Shared list frame: header → tabs → search → rows → pager. */
export default function InboxLayout({ copy, base, tabKeys, data, tab, q, children }) {
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
