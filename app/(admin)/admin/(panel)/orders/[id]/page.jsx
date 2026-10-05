import { notFound } from "next/navigation";
import { Download, ExternalLink, FileText, Snowflake } from "lucide-react";
import { inboxData } from "@/data/admin/inboxData";
import { orderStatusAction } from "@/app/(admin)/_actions/inbox";
import { can, PERMISSIONS } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { ORDER_FLOW, orderBlockedReason } from "@/lib/inbox/workflow";
import { formatBDT, formatDateTime } from "@/lib/utils";
import { getOrder } from "@/services/admin/inbox";
import { BackLink, ContactButtons, Facts, History, NotEmailedFlag, StatusPill } from "@/components/admin/inbox/bits";
import StatusActions from "@/components/admin/inbox/StatusActions";
import PrescriptionReview from "@/components/admin/inbox/PrescriptionReview";
import NotesPanel from "@/components/admin/inbox/NotesPanel";
import { Eyebrow } from "@/components/ui/SectionHeading";

const O = inboxData.orders;
const R = O.rx;
const RX_TONE = { pending: "alert", verified: "sage", rejected: "muted", not_required: "muted" };
const TONE = { processing: "primary", dispatched: "primary", delivered: "primary", cancelled: "danger" };

export async function generateMetadata({ params }) {
  const o = await getOrder((await params).id).catch(() => null);
  return { title: o ? `${o.reference} · ${O.meta.title}` : O.meta.title };
}

export default async function OrderPage({ params }) {
  const user = await requireUser(PERMISSIONS.inboxRead);
  const o = await getOrder((await params).id);
  if (!o) notFound();
  const canWrite = can(user.role, PERMISSIONS.inboxWrite);
  const D = O.detail;

  const order = { prescription: { required: o.rxRequired, status: o.rxStatus } };
  const gated = ORDER_FLOW[o.status].some((to) => orderBlockedReason(order, to));
  const options = ORDER_FLOW[o.status].map((to) => ({
    to,
    label: O.actions[to],
    tone: TONE[to],
    note: to === "cancelled" ? "optional" : undefined,
    disabled: Boolean(orderBlockedReason(order, to)),
  }));
  const fileUrl = `/api/admin/prescriptions/${o.id}`;

  return (
    <article>
      <BackLink href="/admin/orders" />
      <header className="mb-8 flex flex-col gap-3 border-b border-line pb-8">
        <Eyebrow>{o.reference}</Eyebrow>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{o.name}</h1>
          <StatusPill status={o.status} label={O.status[o.status]} />
          {!o.emailed ? <NotEmailedFlag /> : null}
        </div>
        <p className="text-ink-soft">{formatDateTime(o.createdAt)}</p>
        <ContactButtons phone={o.phone} name={o.name} />
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-8">
          {o.rxStatus !== "not_required" || o.rxRequired ? (
            <section aria-labelledby="rx-heading" className="flex flex-col gap-4 rounded-[1.25rem] bg-white p-5 ring-1 ring-line">
              <div className="flex flex-wrap items-center gap-3">
                <h2 id="rx-heading" className="text-lg font-semibold">
                  {R.heading}
                </h2>
                <StatusPill status={o.rxStatus} label={R.status[o.rxStatus]} tone={RX_TONE[o.rxStatus]} />
              </div>
              {o.file ? (
                <div className="flex flex-wrap gap-2">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800 ring-1 ring-brand-200 hover:bg-brand-100"
                  >
                    <FileText aria-hidden="true" className="size-4" />
                    {R.view}
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                  </a>
                  <a
                    href={`${fileUrl}?download=1`}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-soft ring-1 ring-line hover:ring-brand-300"
                  >
                    <Download aria-hidden="true" className="size-4" />
                    {R.download}
                  </a>
                </div>
              ) : (
                <p className="text-sm text-ink-muted">{R.none}</p>
              )}
              {o.reviewedAt ? <p className="text-sm text-ink-muted">{R.reviewedBy(o.reviewer, formatDateTime(o.reviewedAt))}</p> : null}
              {o.rejectReason ? <p className="text-sm text-alert-700">{o.rejectReason}</p> : null}
              {canWrite && o.rxStatus === "pending" ? <PrescriptionReview id={o.id} required={o.rxRequired} /> : null}
            </section>
          ) : null}

          <section aria-labelledby="items-heading">
            <h2 id="items-heading" className="mb-3 text-lg font-semibold">
              {D.items}
            </h2>
            {o.items.length ? (
              <div className="overflow-x-auto rounded-[1.25rem] bg-white ring-1 ring-line">
                <table className="w-full text-left text-[0.95rem]">
                  <thead className="text-sm text-ink-muted">
                    <tr className="border-b border-line">
                      <th scope="col" className="px-5 py-3 font-normal">{D.items}</th>
                      <th scope="col" className="px-3 py-3 text-right font-normal">{D.qty}</th>
                      <th scope="col" className="px-5 py-3 text-right font-normal">{D.unit}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {o.items.map((i) => (
                      <tr key={i.name} className="border-b border-line last:border-0">
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1.5">
                            {i.name}
                            {i.coldChain ? <Snowflake aria-label={D.coldChain} className="size-4 text-brand-600" /> : null}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">{i.quantity}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{formatBDT(i.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th scope="row" colSpan={2} className="px-5 py-3 text-left font-semibold">
                        {D.subtotal}
                      </th>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatBDT(o.subtotal)}</td>
                    </tr>
                  </tfoot>
                </table>
                <p className="border-t border-line px-5 py-3 text-sm text-ink-muted">{D.subtotalHint}</p>
              </div>
            ) : (
              <p className="rounded-[1.25rem] bg-white px-5 py-4 text-ink-soft ring-1 ring-line">{D.generalRx}</p>
            )}
          </section>

          <Facts rows={[[D.address, o.address], [D.note, o.note]]} />

          {canWrite ? (
            <StatusActions
              action={orderStatusAction}
              id={o.id}
              from={o.status}
              options={options}
              disabledReason={gated ? R.gate : null}
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-10">
          <NotesPanel kind="order" id={o.id} notes={o.notes} canWrite={canWrite} />
          <History history={o.history} labels={O.status} createdAt={o.createdAt} />
        </div>
      </div>
    </article>
  );
}
