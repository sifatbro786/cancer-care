import Link from "next/link";
import { contactData } from "@/data/contactData";
import { inboxData } from "@/data/admin/inboxData";
import { isDbConfigured } from "@/lib/db/connect";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { cn, formatDateTime } from "@/lib/utils";
import { listMessages, MESSAGE_TAB_KEYS } from "@/services/admin/inbox";
import InboxLayout, { listParams, rowClass } from "@/components/admin/inbox/InboxLayout";
import { NotEmailedFlag, StatusPill } from "@/components/admin/inbox/bits";

const M = inboxData.messages;
const SUBJECTS = Object.fromEntries(contactData.form.fields.subject.options.map((o) => [o.value, o.label]));
export const metadata = { title: M.meta.title };

export default async function MessagesPage({ searchParams }) {
  await requireUser(PERMISSIONS.inboxRead);
  const { tab, q, page } = listParams(await searchParams, MESSAGE_TAB_KEYS, "unread");
  const data = isDbConfigured() ? await listMessages({ tab, q, page }) : null;

  return (
    <InboxLayout copy={M} base="/admin/messages" tabKeys={MESSAGE_TAB_KEYS} data={data} tab={tab} q={q}>
      {data?.items.map((m) => (
        <li key={m.id}>
          <Link href={`/admin/messages/${m.id}`} className={rowClass}>
            <div className="sm:w-48 sm:shrink-0">
              <p className={cn("truncate", m.status === "unread" ? "font-bold text-ink" : "font-semibold text-ink-soft")}>{m.name}</p>
              <p className="text-sm text-ink-muted">{formatDateTime(m.createdAt)}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-800">{SUBJECTS[m.subject] ?? m.subject}</p>
              <p className="line-clamp-2 text-[0.95rem] text-ink-soft">{m.preview}</p>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              <StatusPill status={m.status} label={M.status[m.status]} />
              {!m.emailed ? <NotEmailedFlag /> : null}
            </div>
          </Link>
        </li>
      ))}
    </InboxLayout>
  );
}
