import Link from "next/link";
import { authData } from "@/data/admin/authData";
import { inboxData } from "@/data/admin/inboxData";
import { isDbConfigured } from "@/lib/db/connect";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { formatIsoDay, formatSlot } from "@/lib/schedule";
import { cn } from "@/lib/utils";
import { getOverviewCounts } from "@/services/admin/overview";
import { todaysAppointments } from "@/services/admin/inbox";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { StatusPill } from "@/components/admin/inbox/bits";
import { FormAlert } from "@/components/ui/Field";

export const metadata = { title: authData.meta.overviewTitle };

export default async function OverviewPage({ searchParams }) {
  const user = await requireUser(PERMISSIONS.inboxRead);
  const O = authData.overview;
  const A = inboxData.appointments;
  const db = isDbConfigured();
  const [counts, today, sp] = await Promise.all([
    getOverviewCounts(),
    db ? todaysAppointments() : null,
    searchParams,
  ]);
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <AdminPageHeader eyebrow={O.eyebrow} title={O.greeting(firstName)} highlight={firstName} description={O.intro} />

      <div className="mb-8 flex flex-col gap-3 empty:hidden">
        {sp.denied ? <FormAlert>{O.denied}</FormAlert> : null}
        {!counts ? <FormAlert tone="info">{O.dbOff}</FormAlert> : null}
      </div>

      {counts ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {O.cards.map((c) => {
            const value = counts[c.key];
            const flagged = c.key === "unsent" && value > 0;
            const body = (
              <>
                <span className="font-semibold text-ink">{c.label}</span>
                <span className={cn("font-serif text-5xl leading-none", flagged ? "text-alert-700" : "text-brand-700")}>
                  {value}
                </span>
                <span className="text-sm text-ink-muted">{c.hint}</span>
              </>
            );
            const box = cn(
              "flex h-full flex-col gap-2 rounded-[1.25rem] bg-white p-6 ring-1 ring-line",
              flagged && "ring-alert-600/30"
            );
            return (
              <li key={c.key}>
                {c.href ? (
                  <Link
                    href={c.href}
                    className={cn(box, "transition-shadow hover:shadow-soft hover:ring-brand-300 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-500")}
                  >
                    {body}
                  </Link>
                ) : (
                  <div className={box}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      {today ? (
        <section aria-labelledby="today-heading" className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="today-heading" className="text-2xl font-semibold">
              {A.today.heading} <span className="font-serif text-xl font-normal text-ink-muted italic">{formatIsoDay(today.day)}</span>
            </h2>
            <Link href="/admin/appointments" className="text-sm font-semibold text-brand-700 hover:text-brand-900">
              {A.today.all} →
            </Link>
          </div>
          {today.items.length ? (
            <ul className="mt-5 divide-y divide-line rounded-[1.25rem] bg-white ring-1 ring-line">
              {today.items.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/admin/appointments/${a.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-paper focus-visible:outline-2 focus-visible:outline-brand-500"
                  >
                    <span className="w-20 shrink-0 font-serif text-lg text-brand-700">{formatSlot(a.slot)}</span>
                    <span className="min-w-0 flex-1 truncate font-semibold">{a.name}</span>
                    <span className="hidden text-sm text-ink-muted sm:inline">{A.type[a.type]}</span>
                    <StatusPill status={a.status} label={A.status[a.status]} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-ink-muted">{A.today.empty}</p>
          )}
        </section>
      ) : null}
    </>
  );
}
