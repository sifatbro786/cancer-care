import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSiteConfig } from "@/services/content";
import { whatsappLink } from "@/lib/site";
import Logo from "@/components/brand/Logo";
import Button from "@/components/ui/Button";
import { brandIconMap, WhatsappIcon } from "@/components/icons/BrandIcons";

export default async function Footer() {
  const siteConfig = await getSiteConfig();
  const whatsappHref = whatsappLink(siteConfig.contact);
  const { footer, contact, address, hours, social, cta, name } = siteConfig;
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-brand-950 text-brand-100 print:hidden">
      <div aria-hidden="true" className="bg-grain pointer-events-none absolute inset-0 opacity-40 invert" />

      <div className="container-site relative grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
        {/* Brand + about */}
        <div className="lg:col-span-3">
          <Logo invert />
          <p className="mt-6 max-w-sm leading-relaxed text-brand-100/85">{footer.about}</p>
          <ul className="mt-6 flex gap-2" aria-label="Social media">
            {social.map((s) => {
              const Icon = brandIconMap[s.key];
              return (
                <li key={s.key}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid size-11 place-items-center rounded-xl bg-white/5 text-brand-100 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {Icon ? <Icon className="size-4" /> : null}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 text-[0.95rem] sm:grid-cols-3 lg:col-span-5 lg:pl-6">
          {footer.columns.map((col) => (
            <div key={col.title}>
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-white">
                {col.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-brand-100/85 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact card */}
        <div className="lg:col-span-4">
          <div className="rounded-[var(--radius-card)] bg-white/5 p-6 ring-1 ring-white/10">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-white">Visit / Call</h2>
            <address className="mt-5 space-y-4 not-italic">
              <a href={contact.phoneHref} className="flex items-start gap-3 font-semibold text-white hover:text-brand-200">
                <Phone aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-300" />
                {contact.phone}
              </a>
              <a href={contact.emailHref} className="flex items-start gap-3 [overflow-wrap:anywhere] hover:text-white">
                <Mail aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-300" />
                {contact.email}
              </a>
              <a
                href={address.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 hover:text-white"
              >
                <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-300" />
                {address.full}
              </a>
            </address>
            <ul className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm">
              {hours.map((h) => (
                <li key={h.label} className="flex items-start gap-3">
                  <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-300" />
                  <span>
                    <span className="block font-semibold text-white">{h.label}</span>
                    {h.days} · {h.time}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-2">
              <Button href={cta.primary.href} variant="light" size="sm" withArrow className="justify-between">
                {cta.primary.label}
              </Button>
              <Button href={whatsappHref} variant="outlineLight" size="sm" icon={WhatsappIcon}>
                Chat on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-site flex flex-col gap-4 py-6 text-sm text-brand-100/75 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {name}. {footer.rights}{" "}
            <span className="block sm:inline">
              {footer.credit.prefix}{" "}
              <a
                href={footer.credit.href}
                target="_blank"
                rel="noopener"
                className="font-semibold text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
              >
                {footer.credit.label}
              </a>
            </span>
          </p>
          <ul aria-label="Legal" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {footer.legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-white hover:underline hover:underline-offset-4">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
