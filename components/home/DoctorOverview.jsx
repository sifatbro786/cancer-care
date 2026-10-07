import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";
import { Eyebrow } from "@/components/ui/SectionHeading";
import SmartImage from "@/components/ui/SmartImage";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";

/**
 * Doctor introduction — editorial layout: a plain portrait with a caption,
 * a typographic credentials table and one serif pull quote. No badges, no stickers.
 */
export default function DoctorOverview({ data, doctor }) {
  const { eyebrow, cta, labels } = data;
  const [current, previous] = doctor.affiliations;

  const rows = [
    { term: labels.role, value: `${doctor.designation}, ${current.name}` },
    previous ? { term: labels.previously, value: `${previous.role}, ${previous.name}` } : null,
    { term: labels.qualifications, value: doctor.degrees.join(" · ") },
    { term: labels.focus, value: doctor.specialties.join(", ") },
    { term: labels.languages, value: doctor.languages.join(" & ") },
  ].filter(Boolean);

  return (
    <section aria-labelledby="doctor-title" className="py-20 sm:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-20">
        <Reveal as="figure" className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-mist">
            <SmartImage
              src={doctor.photo.src}
              alt={doctor.photo.alt}
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover object-top"
            />
          </div>
          <figcaption className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4 text-sm text-ink-muted">
            <span>{doctor.shortTitle}</span>
            <span>{current.name}</span>
          </figcaption>
        </Reveal>

        <Reveal delay={0.08} className="flex flex-col lg:col-span-7 lg:pt-6">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 id="doctor-title" className="mt-5 text-4xl leading-[1.08] font-semibold tracking-[-0.025em] sm:text-5xl">
            {doctor.name}
          </h2>
          <p className="mt-3 font-display text-lg font-medium text-brand-700">{doctor.shortTitle}</p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{doctor.summary}</p>

          <dl className="mt-10 divide-y divide-line border-y border-line">
            {rows.map((r) => (
              <div key={r.term} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <dt className="text-sm font-semibold tracking-wide text-ink-muted">{r.term}</dt>
                <dd className="leading-relaxed text-ink">{r.value}</dd>
              </div>
            ))}
          </dl>

          <blockquote className="mt-10 max-w-xl border-l-2 border-brand-500 pl-6">
            <p className="font-display text-2xl leading-snug font-medium tracking-[-0.01em] text-ink">“{doctor.philosophy.quote}”</p>
            <footer className="mt-3 text-sm text-ink-muted">{doctor.philosophy.signature}</footer>
          </blockquote>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Button href={siteConfig.cta.primary.href} withArrow>
              {siteConfig.cta.primary.label}
            </Button>
            <Link
              href={cta.href}
              className="group inline-flex items-center gap-2 font-display font-semibold text-brand-700 underline-offset-4 hover:underline"
            >
              {cta.label}
              <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
