import { notFound } from "next/navigation";
import { inboxData } from "@/data/admin/inboxData";
import { appointmentStatusAction } from "@/app/(admin)/_actions/inbox";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { APPOINTMENT_FLOW } from "@/lib/inbox/workflow";
import { formatIsoDay, formatSlot } from "@/lib/schedule";
import { formatDateTime } from "@/lib/utils";
import { getAppointment } from "@/services/admin/inbox";
import { BackLink, ContactButtons, Facts, History, NotEmailedFlag, StatusPill } from "@/components/admin/inbox/bits";
import StatusActions from "@/components/admin/inbox/StatusActions";
import NotesPanel from "@/components/admin/inbox/NotesPanel";
import { Eyebrow } from "@/components/ui/SectionHeading";

const A = inboxData.appointments;
const TONE = { confirmed: "primary", completed: "primary", new: "secondary", cancelled: "danger" };

export async function generateMetadata({ params }) {
  const a = await getAppointment((await params).id).catch(() => null);
  return { title: a ? `${a.reference} · ${A.meta.title}` : A.meta.title };
}

export default async function AppointmentPage({ params }) {
  const user = await requireUser(PERMISSIONS.inboxRead);
  const a = await getAppointment((await params).id);
  if (!a) notFound();
  const canWrite = can(user.role, PERMISSIONS.inboxWrite);
  const D = A.detail;

  const options = APPOINTMENT_FLOW[a.status].map((to) => ({
    to,
    label: A.actions[to],
    tone: TONE[to],
    note: to === "cancelled" ? "optional" : undefined,
  }));

  return (
    <article>
      <BackLink href="/admin/appointments" />
      <header className="mb-8 flex flex-col gap-3 border-b border-line pb-8">
        <Eyebrow>{a.reference}</Eyebrow>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{a.name}</h1>
          <StatusPill status={a.status} label={A.status[a.status]} />
          {!a.emailed ? <NotEmailedFlag /> : null}
        </div>
        <p className="text-ink-soft">
          {formatIsoDay(a.date)} · <span className="font-serif text-xl text-brand-700">{formatSlot(a.slot)}</span> · {A.type[a.type]}
        </p>
        <ContactButtons phone={a.phone} email={a.email} name={a.name} />
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-8">
          <Facts
            rows={[
              [D.requested, `${formatIsoDay(a.date)}, ${formatSlot(a.slot)}`],
              [D.type, A.type[a.type]],
              [D.service, a.service ?? D.noService],
              [D.visit, A.visit[a.visit]],
              [D.age, a.age],
              [D.email, a.email],
              [D.message, a.message],
              [inboxData.common.received, formatDateTime(a.createdAt)],
              [D.consent, a.consentAt ? formatDateTime(a.consentAt) : null],
            ]}
          />
          {canWrite ? <StatusActions action={appointmentStatusAction} id={a.id} from={a.status} options={options} /> : null}
        </div>
        <div className="flex flex-col gap-10">
          <NotesPanel kind="appointment" id={a.id} notes={a.notes} canWrite={canWrite} />
          <History history={a.history} labels={A.status} createdAt={a.createdAt} />
        </div>
      </div>
    </article>
  );
}
