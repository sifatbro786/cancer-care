import { BadgeCheck, Building2, Quote } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";
import SectionHeading from "@/components/ui/SectionHeading";
import SmartImage from "@/components/ui/SmartImage";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Reveal from "@/components/motion/Reveal";

export default function DoctorOverview({ data, doctor }) {
  const { eyebrow, title, highlight, sticker, cta } = data;

  return (
    <section aria-labelledby="doctor-title" className="bg-chart py-20 sm:py-28">
      <div className="container-site grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
        {/* Portrait */}
        <Reveal className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-brand-100 shadow-lift">
            <SmartImage
              src={doctor.photo.src}
              alt={doctor.photo.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-4 shadow-soft backdrop-blur">
              <p className="font-display text-lg font-semibold text-ink">{doctor.name}</p>
              <p className="text-sm text-ink-soft">{doctor.degrees.join(", ")}</p>
            </div>
          </div>
          {/* Taped sticker */}
          <p
            aria-hidden="true"
            className="absolute -top-4 -right-2 rotate-[5deg] rounded-md bg-paper px-4 pt-3 pb-2 font-hand text-2xl leading-none text-coral-700 shadow-lg sm:-right-6"
          >
            <span className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 rotate-2 bg-brand-200/80" />
            {sticker}
          </p>
        </Reveal>

        {/* Bio */}
        <Reveal delay={0.08} className="lg:col-span-7">
          <SectionHeading id="doctor-title" eyebrow={eyebrow} title={title} highlight={highlight} align="left" />

          <p className="mt-6 text-lg leading-relaxed text-ink-soft">{doctor.summary}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
            <Badge tone="solid" icon={BadgeCheck}>
              {doctor.shortTitle}
            </Badge>
            <span className="text-[0.95rem] font-semibold text-ink">{doctor.designation}</span>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {doctor.affiliations.map((a) => (
              <li key={a.name} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-line">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Building2 aria-hidden="true" className="size-5" />
                </span>
                <span>
                  <span className="block leading-snug font-semibold text-ink">{a.name}</span>
                  <span className="text-sm text-ink-soft">
                    {a.period} · {a.role}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Specialties">
            {doctor.specialties.map((s) => (
              <li key={s}>
                <Badge tone="neutral" className="px-3.5 py-1.5 text-[0.8rem] font-medium tracking-normal">
                  {s}
                </Badge>
              </li>
            ))}
          </ul>

          <figure className="relative mt-8 rounded-2xl border-l-4 border-coral-400 bg-white p-6 shadow-soft">
            <Quote aria-hidden="true" className="absolute top-5 right-5 size-8 text-brand-100" />
            <blockquote className="pr-8 text-lg leading-relaxed text-ink italic">“{doctor.philosophy.quote}”</blockquote>
            <figcaption className="mt-3 font-hand text-2xl text-brand-700">{doctor.philosophy.signature}</figcaption>
          </figure>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={cta.href} withArrow>
              {cta.label}
            </Button>
            <Button href={siteConfig.cta.primary.href} variant="secondary">
              {siteConfig.cta.primary.label}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
