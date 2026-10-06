import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { getSiteConfig } from "@/services/content";
import { IconByKey } from "@/lib/icons";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/ui/SmartImage";
import Reveal from "@/components/motion/Reveal";

function IconChip({ name, tone = "light" }) {
  return (
    <span
      className={
        tone === "light"
          ? "grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100"
          : "grid size-11 place-items-center rounded-xl bg-white/12 text-white ring-1 ring-white/20"
      }
    >
      <IconByKey name={name} aria-hidden="true" className="size-5" />
    </span>
  );
}

export default async function InfoStrip({ data }) {
  const siteConfig = await getSiteConfig();
  const { hours, call, directions, schedule } = data;
  const { contact, address } = siteConfig;

  return (
    <section aria-label="Quick information" className="pb-10">
      <ul className="container-site grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal as="li" className="h-full">
          <Card className="flex h-full flex-col p-6">
            <IconChip name={hours.icon} />
            <h2 className="mt-5 text-lg font-semibold">{hours.title}</h2>
            <ul className="mt-2 space-y-1 text-[0.95rem] text-ink-soft">
              {hours.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <p className="mt-auto pt-5 text-sm text-ink-soft">
              {hours.footnote} <strong className="font-bold text-brand-700">{hours.footnoteStrong}</strong>
            </p>
          </Card>
        </Reveal>

        <Reveal as="li" delay={0.06} className="h-full">
          <Card tone="brand" className="flex h-full flex-col overflow-hidden p-6">
            <IconChip name="heart" tone="dark" />
            <h2 className="mt-5 text-lg leading-snug font-semibold text-white">{call.title}</h2>
            <a
              href={contact.phoneHref}
              className="mt-auto inline-flex items-center gap-3 pt-6 font-display text-xl font-bold text-white hover:text-brand-100"
            >
              <span className="grid size-10 place-items-center rounded-full bg-white text-brand-700">
                <Phone aria-hidden="true" className="size-4" />
              </span>
              {contact.phone}
            </a>
          </Card>
        </Reveal>

        <Reveal as="li" delay={0.12} className="h-full">
          <Card className="flex h-full flex-col p-6">
            <IconChip name={directions.icon} />
            <h2 className="mt-5 text-lg font-semibold">{directions.title}</h2>
            <p className="mt-2 flex items-start gap-2 text-[0.95rem] text-ink-soft">
              <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-600" />
              {address.full}
            </p>
            <a
              href={address.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
            >
              {directions.linkLabel}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </Card>
        </Reveal>

        <Reveal as="li" delay={0.18} className="h-full">
          <Card className="isolate flex h-full min-h-56 flex-col overflow-hidden p-6 ring-0">
            <SmartImage
              src={schedule.image.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="-z-10 object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/50 to-ink/10" />
            <h2 className="mt-auto text-lg leading-snug font-semibold text-white">{schedule.title}</h2>
            <Button href={schedule.cta.href} variant="light" size="sm" withArrow className="mt-4 self-start">
              {schedule.cta.label}
            </Button>
          </Card>
        </Reveal>
      </ul>
    </section>
  );
}
