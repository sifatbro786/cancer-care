import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { contactData } from "@/data/contactData";
import { siteConfig, whatsappHref } from "@/data/siteConfig";
import { buildMetadata } from "@/lib/seo";
import PageHeader from "@/components/layout/PageHeader";
import ContactForm from "@/components/contact/ContactForm";
import { WhatsappIcon } from "@/components/icons/BrandIcons";

export const metadata = buildMetadata("contact");

export default function ContactPage() {
  const { header, channels, hoursTitle, mapTitle, form } = contactData;
  const { contact, address, hours } = siteConfig;

  const cards = [
    { key: "call", icon: Phone, ...channels.call, value: contact.phone, href: contact.phoneHref },
    { key: "whatsapp", icon: WhatsappIcon, ...channels.whatsapp, value: channels.whatsapp.cta, href: whatsappHref, external: true },
    { key: "email", icon: Mail, ...channels.email, value: contact.email, href: contact.emailHref },
  ];

  return (
    <>
      <PageHeader
        crumbs={[siteConfig.nav[0], { label: header.eyebrow, href: "/contact" }]}
        eyebrow={header.eyebrow}
        title={header.title}
        highlight={header.highlight}
        description={header.description}
      />

      <section aria-label={header.eyebrow} className="container-site py-14 sm:py-20">
        <ul className="grid gap-4 md:grid-cols-3">
          {cards.map(({ key, icon: Icon, title, text, value, href, external }) => (
            <li key={key}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex h-full flex-col rounded-[1.25rem] bg-white p-6 ring-1 ring-line transition-shadow hover:shadow-lift"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-mist text-brand-700">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="mt-5 font-display text-lg font-semibold">{title}</span>
                <span className="mt-1 text-[0.95rem] text-ink-soft">{text}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 font-semibold [overflow-wrap:anywhere] text-brand-700 group-hover:underline">
                  {value}
                  <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="rounded-[1.5rem] bg-white p-6 ring-1 ring-line sm:p-8 lg:col-span-7">
            <h2 className="text-2xl font-semibold">{form.title}</h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="relative min-h-72 flex-1 overflow-hidden rounded-[1.5rem] bg-mist ring-1 ring-line">
              <iframe
                title={mapTitle}
                src={address.mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 size-full border-0"
              />
            </div>
            <div className="rounded-[1.5rem] bg-white p-6 ring-1 ring-line">
              <p className="flex items-start gap-3">
                <MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand-600" />
                <span>
                  <span className="block font-semibold">{channels.visit.title}</span>
                  <span className="text-ink-soft">{address.full}</span>
                </span>
              </p>
              <a
                href={address.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 ml-8 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
              >
                {channels.visit.cta}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
              <h3 className="mt-6 border-t border-line pt-5 text-sm font-semibold tracking-wide text-ink-muted uppercase">
                {hoursTitle}
              </h3>
              <dl className="mt-3 space-y-2">
                {hours.map((h) => (
                  <div key={h.label} className="flex flex-wrap justify-between gap-x-4">
                    <dt className="font-medium">{h.label}</dt>
                    <dd className="text-ink-soft">
                      {h.days} · {h.time}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
