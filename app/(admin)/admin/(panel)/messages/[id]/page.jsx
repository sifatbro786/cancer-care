import { notFound } from "next/navigation";
import { contactData } from "@/data/contactData";
import { inboxData } from "@/data/admin/inboxData";
import { messageStatusAction } from "@/app/(admin)/_actions/inbox";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { MESSAGE_FLOW } from "@/lib/inbox/workflow";
import { formatDateTime } from "@/lib/utils";
import { getMessage } from "@/services/admin/inbox";
import { BackLink, ContactButtons, NotEmailedFlag, StatusPill } from "@/components/admin/inbox/bits";
import StatusActions from "@/components/admin/inbox/StatusActions";
import MarkReadOnView from "@/components/admin/inbox/MarkReadOnView";
import { Eyebrow } from "@/components/ui/SectionHeading";

const M = inboxData.messages;
const SUBJECTS = Object.fromEntries(contactData.form.fields.subject.options.map((o) => [o.value, o.label]));

export async function generateMetadata({ params }) {
  const m = await getMessage((await params).id).catch(() => null);
  return { title: m ? `${m.reference} · ${M.meta.title}` : M.meta.title };
}

export default async function MessagePage({ params }) {
  const user = await requireUser(PERMISSIONS.inboxRead);
  const m = await getMessage((await params).id);
  if (!m) notFound();
  const canWrite = can(user.role, PERMISSIONS.inboxWrite);

  // An unread message is being opened → it will be marked read; show the buttons for "read".
  const shownStatus = canWrite && m.status === "unread" ? "read" : m.status;
  const options = MESSAGE_FLOW[shownStatus].map((to) => ({ to, label: M.actions[to], tone: "secondary" }));

  return (
    <article className="max-w-3xl">
      {canWrite && m.status === "unread" ? <MarkReadOnView id={m.id} /> : null}
      <BackLink href="/admin/messages" />
      <header className="mb-8 flex flex-col gap-3 border-b border-line pb-8">
        <Eyebrow>
          {m.reference} · {SUBJECTS[m.subject] ?? m.subject}
        </Eyebrow>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{m.name}</h1>
          <StatusPill status={shownStatus} label={M.status[shownStatus]} />
          {!m.emailed ? <NotEmailedFlag /> : null}
        </div>
        <p className="text-ink-soft">{formatDateTime(m.createdAt)}</p>
        <ContactButtons phone={m.phone} email={m.email} name={m.name} />
      </header>

      <blockquote className="rounded-[1.25rem] bg-white px-6 py-5 text-[1.05rem] leading-relaxed whitespace-pre-line text-ink ring-1 ring-line">
        {m.message}
      </blockquote>
      {m.readAt ? <p className="mt-3 text-sm text-ink-muted">{M.readBy(m.readBy, formatDateTime(m.readAt))}</p> : null}

      {canWrite ? (
        <div className="mt-8">
          <StatusActions action={messageStatusAction} id={m.id} from={shownStatus} options={options} />
        </div>
      ) : null}
    </article>
  );
}
