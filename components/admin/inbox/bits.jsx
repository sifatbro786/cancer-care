import Link from "next/link";
import { MessageCircle, Phone, Mail, TriangleAlert, Search } from "lucide-react";
import { inboxData } from "@/data/admin/inboxData";
import { siteConfig } from "@/data/siteConfig";
import { cn, formatDateTime } from "@/lib/utils";

/**
 * Small server-rendered building blocks shared by the three inboxes.
 * Navigation (tabs, search, pager) is plain links/GET forms → works without JS,
 * every view is a shareable URL, and the server does the filtering/paging.
 */

const C = inboxData.common;

const TONES = {
  brand: "bg-brand-50 text-brand-800 ring-brand-200",
  sage: "bg-sage-50 text-sage-700 ring-sage-100",
  alert: "bg-alert-50 text-alert-700 ring-alert-600/20",
  muted: "bg-paper-deep text-ink-soft ring-line",
};

export function StatusPill({ status, label, tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1",
        TONES[tone ?? C.statusTone[status] ?? "muted"]
      )}
    >
      {label}
    </span>
  );
}

const qs = (params) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "" && v !== 1) sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : "";
};

export function InboxTabs({ base, tabs, active, label }) {
  return (
    <nav aria-label={label} className="-mx-1 overflow-x-auto pb-1">
      <ul className="flex gap-1 px-1">
        {tabs.map((t) => {
          const current = t.key === active;
          return (
            <li key={t.key}>
              <Link
                href={`${base}${qs({ tab: t.key })}`}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
                  current ? "bg-brand-700 text-white" : "text-ink-soft hover:bg-white hover:text-ink"
                )}
              >
                {t.label}
                <span className={cn("rounded-full px-1.5 text-xs tabular-nums", current ? "bg-white/20" : "bg-paper-deep text-ink-muted")}>
                  {t.count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SearchBox({ base, tab, q }) {
  return (
    <form role="search" action={base} method="get" className="flex w-full max-w-md gap-2">
      <input type="hidden" name="tab" value={tab} />
      <label htmlFor="inbox-q" className="sr-only">
        {C.searchLabel}
      </label>
      <div className="relative flex-1">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
        <input
          id="inbox-q"
          name="q"
          type="search"
          defaultValue={q}
          maxLength={60}
          placeholder={C.searchPlaceholder}
          className="h-11 w-full rounded-xl bg-white pr-3 pl-9 text-[0.95rem] ring-1 ring-line outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <button
        type="submit"
        className="h-11 rounded-xl bg-white px-4 text-sm font-semibold text-brand-800 ring-1 ring-line hover:ring-brand-300 focus-visible:outline-2 focus-visible:outline-brand-500"
      >
        {C.searchButton}
      </button>
      {q ? (
        <Link href={`${base}${qs({ tab })}`} className="self-center text-sm font-semibold text-ink-soft hover:text-brand-800">
          {C.clear}
        </Link>
      ) : null}
    </form>
  );
}

export function Pager({ base, page, pages, tab, q }) {
  if (pages <= 1) return null;
  const link = "rounded-lg px-3.5 py-2 text-sm font-semibold text-brand-800 ring-1 ring-line hover:ring-brand-300";
  return (
    <nav aria-label={C.pageOf(page, pages)} className="mt-6 flex items-center justify-between">
      {page > 1 ? (
        <Link href={`${base}${qs({ tab, q, page: page - 1 })}`} className={link}>
          ← {C.prev}
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-ink-muted">{C.pageOf(page, pages)}</span>
      {page < pages ? (
        <Link href={`${base}${qs({ tab, q, page: page + 1 })}`} className={link}>
          {C.next} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function EmptyState({ q }) {
  return <p className="rounded-[1.25rem] bg-white px-6 py-12 text-center text-ink-muted ring-1 ring-line">{q ? C.emptySearch(q) : C.empty}</p>;
}

export function NotEmailedFlag({ compact = false }) {
  return (
    <span title={C.notEmailedHint} className="inline-flex items-center gap-1 text-xs font-semibold text-alert-700">
      <TriangleAlert aria-hidden="true" className="size-3.5" />
      {compact ? <span className="sr-only">{C.notEmailed}</span> : C.notEmailed}
    </span>
  );
}

/** Tap-to-call / WhatsApp — the clinic confirms everything by phone. */
export function ContactButtons({ phone, email, name }) {
  const intl = `880${phone.slice(1)}`; // 01XXXXXXXXX → 8801XXXXXXXXX
  const greet = encodeURIComponent(`Hello ${name ?? ""}, this is ${siteConfig.shortName}.`);
  const btn =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";
  return (
    <div className="flex flex-wrap gap-2">
      <a href={`tel:+${intl}`} className={cn(btn, "bg-brand-600 text-white ring-brand-600 hover:bg-brand-700")}>
        <Phone aria-hidden="true" className="size-4" />
        {C.call} {phone}
      </a>
      <a href={`https://wa.me/${intl}?text=${greet}`} target="_blank" rel="noopener noreferrer" className={cn(btn, "bg-white text-ink ring-line hover:ring-brand-300")}>
        <MessageCircle aria-hidden="true" className="size-4" />
        {C.whatsapp}
      </a>
      {email ? (
        <a href={`mailto:${email}`} className={cn(btn, "bg-white text-ink ring-line hover:ring-brand-300")}>
          <Mail aria-hidden="true" className="size-4" />
          {C.email}
        </a>
      ) : null}
    </div>
  );
}

export function History({ history, labels, createdAt }) {
  const H = C.history;
  return (
    <section aria-labelledby="history-heading">
      <h2 id="history-heading" className="text-lg font-semibold">
        {H.heading}
      </h2>
      <ol className="mt-4 flex flex-col gap-3 border-l border-line pl-5">
        {(history.length ? history : [{ status: "new", at: createdAt }]).map((h, i) => (
          <li key={`${h.status}-${h.at}-${i}`} className="relative text-sm">
            <span aria-hidden="true" className="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full bg-brand-500 ring-4 ring-paper" />
            <span className="font-semibold text-ink">{h.status === "new" ? (i === 0 ? H.created : H.reopened) : (labels[h.status] ?? h.status)}</span>{" "}
            <span className="text-ink-muted">
              {H.by(h.by)} · {formatDateTime(h.at ?? createdAt)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Two-column definition list used on detail pages. */
export function Facts({ rows }) {
  return (
    <dl className="divide-y divide-line rounded-[1.25rem] bg-white px-5 ring-1 ring-line">
      {rows
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1 py-3.5 sm:flex-row sm:gap-6">
            <dt className="text-sm text-ink-muted sm:w-44 sm:shrink-0">{k}</dt>
            <dd className="min-w-0 break-words whitespace-pre-line text-ink">{v}</dd>
          </div>
        ))}
    </dl>
  );
}

export function BackLink({ href }) {
  return (
    <Link href={href} className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900">
      ← {C.back}
    </Link>
  );
}
