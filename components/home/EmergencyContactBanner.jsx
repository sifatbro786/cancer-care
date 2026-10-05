import { ArrowUpRight, Clock, MapPin, Phone } from "lucide-react";
import { siteConfig, whatsappHref } from "@/data/siteConfig";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import { WhatsappIcon } from "@/components/icons/BrandIcons";

export default function EmergencyContactBanner({ data }) {
  const { eyebrow, title, description, callLabel, whatsappLabel, locationTitle, mapLabel } = data;
  const { contact, address, hours } = siteConfig;

  return (
    <section aria-labelledby="emergency-title" className="py-10 sm:py-14">
      <div className="container-site">
        <Reveal className="relative isolate overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-white sm:px-12 lg:px-16 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-wide text-white/80">
                <span aria-hidden="true" className="size-2 rounded-full bg-alert-600 ring-4 ring-alert-600/25" />
                {eyebrow}
              </p>
              <h2 id="emergency-title" className="mt-5 text-3xl leading-tight font-semibold text-white sm:text-4xl">
                {title}
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/75">{description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={contact.phoneHref} variant="light" size="lg" icon={Phone}>
                  {callLabel} · {contact.phone}
                </Button>
                <Button href={whatsappHref} variant="outlineLight" size="lg" icon={WhatsappIcon}>
                  {whatsappLabel}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10">
                <h3 className="font-display text-sm font-bold tracking-[0.14em] text-white uppercase">{locationTitle}</h3>
                <p className="mt-4 flex items-start gap-3">
                  <MapPin aria-hidden="true" className="mt-1 size-5 shrink-0" />
                  <span>
                    <span className="block font-semibold">{address.line1}</span>
                    {address.line2}
                  </span>
                </p>
                <ul className="mt-4 space-y-2 text-[0.95rem] text-white/75">
                  {hours.slice(0, 2).map((h) => (
                    <li key={h.label} className="flex items-start gap-3">
                      <Clock aria-hidden="true" className="mt-1 size-4 shrink-0" />
                      {h.label}: {h.days}, {h.time}
                    </li>
                  ))}
                </ul>
                <a
                  href={address.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-1.5 font-semibold underline decoration-white/40 underline-offset-4 hover:decoration-white"
                >
                  {mapLabel}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
