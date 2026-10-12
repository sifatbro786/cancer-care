import Link from "next/link";
import { CircleCheck, CircleX, Clock, Phone, TriangleAlert } from "lucide-react";
import { shopData } from "@/data/shopData";
import { enabledPaymentMethods, isOnlineMethod } from "@/lib/payments/config";
import { cn, formatBDT } from "@/lib/utils";
import { getSiteConfig } from "@/services/content";
import { getPaymentView } from "@/services/payments";
import PaymentRetry from "@/components/shop/PaymentRetry";
import { Eyebrow } from "@/components/ui/SectionHeading";

const R = shopData.paymentResult;
export const metadata = { title: R.meta.title, robots: { index: false, follow: false } };

const ICONS = { paid: CircleCheck, unpaid: CircleCheck, review: Clock, pending: Clock, cancel: CircleX, failed: CircleX, cancelledOrder: CircleX, error: TriangleAlert };
const GOOD = new Set(["paid", "unpaid"]);

/**
 * Where bKash / Nagad send the customer back (via our callback routes), and where a
 * customer can retry an unpaid online payment. Shows payment status only — no
 * personal or medical details — so a guessed reference reveals nothing sensitive.
 */
export default async function PaymentPage({ searchParams }) {
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref.toUpperCase() : "";
  const hint = typeof sp.result === "string" ? sp.result : "";
  const [view, site] = await Promise.all([getPaymentView(ref).catch(() => null), getSiteConfig()]);

  // DB status wins; the callback's hint only words a not-paid state ("cancel" vs "failed")
  let state = "error";
  if (view) {
    if (view.cancelled) state = "cancelledOrder";
    else if (view.status === "paid" || view.status === "review" || view.status === "unpaid") state = view.status;
    else if (view.status === "failed") state = hint === "cancel" ? "cancel" : "failed";
    else state = "pending";
  }
  const S = R.states[state];
  const Icon = ICONS[state];
  const online = view?.canPayOnline && state !== "unpaid" ? enabledPaymentMethods().filter(isOnlineMethod) : [];

  return (
    <section className="container-site py-14 sm:py-20">
      <div className="mx-auto max-w-xl rounded-[1.5rem] bg-white p-6 ring-1 ring-line sm:p-10">
        <Eyebrow>{R.eyebrow}</Eyebrow>
        <div className="mt-5 flex items-start gap-4">
          <Icon aria-hidden="true" className={cn("mt-1 size-8 shrink-0", GOOD.has(state) ? "text-brand-600" : "text-alert-600")} />
          <div>
            <h1 className="text-3xl leading-tight font-semibold tracking-[-0.02em]">{S.title}</h1>
            <p className="mt-2 text-lg leading-relaxed text-ink-soft">{S.text}</p>
          </div>
        </div>

        {view ? (
          <dl className="mt-8 divide-y divide-line border-y border-line">
            {[
              [R.reference, <span key="r" className="font-mono">{view.reference}</span>],
              [R.amount, <span key="a" className="tabular-nums">{formatBDT(view.amount)}</span>],
              state === "paid" ? [R.paidWith, shopData.payment.methods[view.method]?.label] : null,
              view.trxId ? [R.trxId, <span key="t" className="font-mono">{view.trxId}</span>] : null,
            ]
              .filter(Boolean)
              .map(([k, v]) => (
                <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 py-3">
                  <dt className="text-sm font-semibold text-ink-muted">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>
        ) : null}

        {online.length ? (
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold">{R.retryHeading}</h2>
            <PaymentRetry reference={view.reference} methods={online} />
            <p className="mt-3 text-sm text-ink-muted">{R.payLater}</p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6 text-sm font-semibold">
          <Link href="/shop" className="text-brand-700 hover:text-brand-900">
            ← {R.backToShop}
          </Link>
          <a href={site.contact.phoneHref} className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-900">
            <Phone aria-hidden="true" className="size-4" />
            {R.call} {site.contact.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
