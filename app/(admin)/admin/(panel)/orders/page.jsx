import Link from "next/link";
import { Snowflake } from "lucide-react";
import { inboxData } from "@/data/admin/inboxData";
import { isDbConfigured } from "@/lib/db/connect";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { formatBDT, formatDateTime } from "@/lib/utils";
import { listOrders, ORDER_TAB_KEYS } from "@/services/admin/inbox";
import InboxLayout, { listParams, rowClass } from "@/components/admin/inbox/InboxLayout";
import { NotEmailedFlag, StatusPill } from "@/components/admin/inbox/bits";

const O = inboxData.orders;
const RX_TONE = { pending: "alert", verified: "sage", rejected: "muted", not_required: "muted" };
export const metadata = { title: O.meta.title };

export default async function OrdersPage({ searchParams }) {
  await requireUser(PERMISSIONS.inboxRead);
  const { tab, q, page } = listParams(await searchParams, ORDER_TAB_KEYS, "rx");
  const data = isDbConfigured() ? await listOrders({ tab, q, page }) : null;

  return (
    <InboxLayout copy={O} base="/admin/orders" tabKeys={ORDER_TAB_KEYS} data={data} tab={tab} q={q} exportKind="orders">
      {data?.items.map((o) => (
        <li key={o.id}>
          <Link href={`/admin/orders/${o.id}`} className={rowClass}>
            <div className="sm:w-48 sm:shrink-0">
              <p className="font-semibold">{o.reference}</p>
              <p className="text-sm text-ink-muted">{formatDateTime(o.createdAt)}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{o.name}</p>
              <p className="text-sm text-ink-muted">{o.phone}</p>
              <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-ink-soft">
                {o.items.length
                  ? o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")
                  : O.detail.generalRx}
                {o.items.some((i) => i.coldChain) ? (
                  <Snowflake aria-label={O.detail.coldChain} className="size-3.5 shrink-0 text-brand-600" />
                ) : null}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
              {o.subtotal ? <span className="font-semibold tabular-nums">{formatBDT(o.subtotal)}</span> : null}
              <StatusPill status={o.status} label={O.status[o.status]} />
              {o.rxStatus !== "not_required" ? (
                <StatusPill status={o.rxStatus} label={`Rx: ${O.rx.status[o.rxStatus]}`} tone={RX_TONE[o.rxStatus]} />
              ) : null}
              {!o.emailed ? <NotEmailedFlag /> : null}
            </div>
          </Link>
        </li>
      ))}
    </InboxLayout>
  );
}
