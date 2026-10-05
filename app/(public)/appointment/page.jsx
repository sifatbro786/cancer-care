import { Suspense } from "react";
import { Phone } from "lucide-react";
import { appointmentData } from "@/data/appointmentData";
import { siteConfig, whatsappHref } from "@/data/siteConfig";
import { buildMetadata } from "@/lib/seo";
import { getServices } from "@/services/content";
import PageHeader from "@/components/layout/PageHeader";
import AppointmentForm from "@/components/appointment/AppointmentForm";
import Button from "@/components/ui/Button";
import { WhatsappIcon } from "@/components/icons/BrandIcons";

export const metadata = buildMetadata("appointment");

export default async function AppointmentPage() {
  const services = await getServices();
  const { header, aside } = appointmentData;
  // Only what the client form needs — keeps the RSC payload small
  const serviceOptions = services.map(({ slug, title }) => ({ slug, title }));

  return (
    <>
      <PageHeader
        crumbs={[siteConfig.nav[0], { label: header.eyebrow, href: "/appointment" }]}
        eyebrow={header.eyebrow}
        title={header.title}
        highlight={header.highlight}
        description={header.description}
      />

      <div className="container-site grid gap-12 py-14 sm:py-20 lg:grid-cols-12 lg:gap-16">
        <div className="min-w-0 lg:col-span-8">
          {/* useSearchParams (?type=, ?service=) needs a Suspense boundary to keep the page static */}
          <Suspense fallback={<div className="h-[60rem] animate-pulse rounded-[1.5rem] bg-white/60" />}>
            <AppointmentForm services={serviceOptions} />
          </Suspense>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <div className="rounded-[1.5rem] bg-white p-6 ring-1 ring-line lg:sticky lg:top-28">
            <h2 className="text-lg font-semibold">{aside.title}</h2>
            <ul className="mt-4 space-y-3">
              {aside.items.map((it) => (
                <li key={it} className="flex gap-3 leading-relaxed text-ink-soft">
                  <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
                  {it}
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-line pt-6">
              <p className="font-semibold">{aside.callTitle}</p>
              <div className="mt-3 grid gap-2">
                <Button href={siteConfig.contact.phoneHref} variant="dark" icon={Phone}>
                  {siteConfig.contact.phone}
                </Button>
                <Button href={whatsappHref} variant="secondary" icon={WhatsappIcon}>
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
