import Link from "next/link";
import { ArrowUpRight, Plus, Search, Tags } from "lucide-react";
import { cmsData } from "@/data/admin/cmsData";
import SmartImage from "@/components/ui/SmartImage";
import { EmptyState, InboxTabs, Pager, StatusPill } from "@/components/admin/inbox/bits";
import RowActions from "@/components/admin/cms/RowActions";

/**
 * Server-rendered content list: toolbar (new / categories / search), optional tabs,
 * rows with quick actions, pager. Search, tabs and pages are plain GET links.
 */

const C = cmsData.common;
const toolbarLink =
  "inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold ring-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";

function SearchForm({ base, tab, q, placeholder }) {
  return (
    <form role="search" action={base} method="get" className="flex w-full max-w-md gap-2">
      {tab ? <input type="hidden" name="tab" value={tab} /> : null}
      <label htmlFor="cms-q" className="sr-only">
        {C.searchLabel}
      </label>
      <div className="relative flex-1">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
        <input
          id="cms-q"
          name="q"
          type="search"
          defaultValue={q}
          maxLength={60}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl bg-white pr-3 pl-9 text-[0.95rem] ring-1 ring-line outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <button type="submit" className="h-11 rounded-xl bg-white px-4 text-sm font-semibold text-brand-800 ring-1 ring-line hover:ring-brand-300 focus-visible:outline-2 focus-visible:outline-brand-500">
        {C.searchButton}
      </button>
      {q ? (
        <Link href={tab ? `${base}?tab=${tab}` : base} className="self-center text-sm font-semibold text-ink-soft hover:text-brand-800">
          {C.clear}
        </Link>
      ) : null}
    </form>
  );
}

export default function EntityList({ entity, list }) {
  const cfg = cmsData.entities[entity];
  const base = `/admin/content/${entity}`;
  const withThumbs = list.rows.some((r) => r.thumb !== undefined);
  const canMove = Boolean(cfg.orderable) && !list.q && list.pages === 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        {cfg.noCreate ? null : (
          <Link href={`${base}/new`} className={`${toolbarLink} bg-brand-600 text-white ring-brand-600 hover:bg-brand-700`}>
            <Plus aria-hidden="true" className="size-4" />
            {C.newItem(cfg.noun)}
          </Link>
        )}
        {cfg.related ? (
          <Link href={cfg.related.href} className={`${toolbarLink} bg-white text-ink ring-line hover:ring-brand-300`}>
            <Tags aria-hidden="true" className="size-4" />
            {cfg.related.label}
          </Link>
        ) : null}
        {cfg.parent ? (
          <Link href={cfg.parent.href} className="text-sm font-semibold text-brand-700 hover:text-brand-900">
            ← {cfg.parent.label}
          </Link>
        ) : null}
        <span className="ml-auto text-sm text-ink-muted">{C.count(list.total)}</span>
      </div>

      {cfg.search ? <SearchForm base={base} tab={list.tab} q={list.q} placeholder={cfg.search.placeholder} /> : null}
      {list.tabs ? <InboxTabs base={base} tabs={list.tabs} active={list.tab} label={cfg.title} /> : null}
      {canMove && list.rows.length > 1 ? <p className="text-sm text-ink-muted">{C.orderHint}</p> : null}

      {list.rows.length ? (
        <ul className="divide-y divide-line overflow-hidden rounded-[1.25rem] bg-white ring-1 ring-line">
          {list.rows.map((row, i) => (
            <li key={row.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
              {withThumbs ? (
                <div className="relative hidden aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg bg-brand-50 sm:block">
                  {row.thumb ? <SmartImage src={row.thumb} alt="" fill sizes="5rem" className="object-cover" /> : null}
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <Link
                  href={`${base}/${row.id}`}
                  className="font-semibold text-ink underline-offset-4 hover:text-brand-800 hover:underline focus-visible:outline-2 focus-visible:outline-brand-500"
                >
                  {row.title}
                </Link>
                {row.meta ? <p className="mt-0.5 truncate text-sm text-ink-muted">{row.meta}</p> : null}
                {row.badges.length || row.view ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {row.badges.map((b) => (
                      <StatusPill key={b.label} label={b.label} tone={b.tone} />
                    ))}
                    {row.view ? (
                      <a
                        href={row.view}
                        target="_blank"
                        rel="noopener"
                        className="ml-1 inline-flex items-center gap-0.5 text-xs font-semibold text-brand-700 hover:text-brand-900"
                      >
                        {C.viewOnSite}
                        <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <RowActions
                entity={entity}
                id={row.id}
                title={row.title}
                toggle={row.toggle}
                canMove={canMove}
                isFirst={i === 0}
                isLast={i === list.rows.length - 1}
                tab={list.tab ?? undefined}
              />
            </li>
          ))}
        </ul>
      ) : list.q ? (
        <EmptyState q={list.q} />
      ) : (
        <p className="rounded-[1.25rem] bg-white px-6 py-12 text-center text-ink-muted ring-1 ring-line">{C.empty}</p>
      )}

      <Pager base={base} page={list.page} pages={list.pages} tab={list.tab ?? undefined} q={list.q || undefined} />
    </div>
  );
}
