import Link from "next/link";
import { inboxData } from "@/data/admin/inboxData";
import { isDbConfigured } from "@/lib/db/connect";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { formatIsoDay, formatSlot } from "@/lib/schedule";
import { APPOINTMENT_TAB_KEYS, listAppointments } from "@/services/admin/inbox";
import InboxLayout, { listParams, rowClass } from "@/components/admin/inbox/InboxLayout";
import { NotEmailedFlag, StatusPill } from "@/components/admin/inbox/bits";

const A = inboxData.appointments;
export const metadata = { title: A.meta.title };

export default async function AppointmentsPage({ searchParams }) {
  await requireUser(PERMISSIONS.inboxRead);
  const { tab, q, page } = listParams(await searchParams, APPOINTMENT_TAB_KEYS, "new");
  const data = isDbConfigured() ? await listAppointments({ tab, q, page }) : null;

  return (
    <InboxLayout copy={A} base="/admin/appointments" tabKeys={APPOINTMENT_TAB_KEYS} data={data} tab={tab} q={q}>
      {data?.items.map((a) => (
        <li key={a.id}>
          <Link href={`/admin/appointments/${a.id}`} className={rowClass}>
            <div className="sm:w-48 sm:shrink-0">
              <p className="font-semibold text-ink">{formatIsoDay(a.date)}</p>
              <p className="font-serif text-xl text-brand-700">{formatSlot(a.slot)}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{a.name}</p>
              <p className="text-sm text-ink-muted">
                {a.phone} · {a.reference}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {A.type[a.type]}
                {a.service ? ` · ${a.service}` : ""} · {A.visit[a.visit]}
              </p>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              <StatusPill status={a.status} label={A.status[a.status]} />
              {!a.emailed ? <NotEmailedFlag /> : null}
            </div>
          </Link>
        </li>
      ))}
    </InboxLayout>
  );
}
