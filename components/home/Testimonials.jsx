import { Star } from "lucide-react";
import { getSiteConfig } from "@/services/content";
import { cn } from "@/lib/utils";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import { brandIconMap, FacebookIcon } from "@/components/icons/BrandIcons";

function Stars({ value }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn("size-4", i < Math.round(value) ? "fill-brand-500 text-brand-500" : "text-line")}
        />
      ))}
    </span>
  );
}

const initialsOf = (name) =>
  name
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default async function Testimonials({ data, testimonials }) {
  const siteConfig = await getSiteConfig();
  const { eyebrow, title, highlight, facebookCta, ratingLabel, reviewsLabel } = data;
  const { items, summary } = testimonials;
  const facebook = siteConfig.social.find((s) => s.key === "facebook");

  return (
    <section aria-labelledby="testimonials-title" className="py-20 sm:py-28">
      <div className="container-site">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading id="testimonials-title" eyebrow={eyebrow} title={title} highlight={highlight} align="left" />

          <Reveal className="flex shrink-0 items-center gap-5 rounded-2xl bg-white p-5 ring-1 ring-line">
            <p className="font-display text-5xl font-semibold tracking-tight text-ink">{summary.average}</p>
            <div>
              <Stars value={summary.average} />
              <p className="mt-1 text-sm text-ink-soft">
                {ratingLabel} · {summary.count}+ {reviewsLabel} {summary.sources.join(" & ")}
              </p>
              {facebook ? (
                <Button
                  href={facebook.href}
                  variant="ghost"
                  size="sm"
                  icon={FacebookIcon}
                  className="mt-2 -ml-3 h-9"
                >
                  {facebookCta.label}
                </Button>
              ) : null}
            </div>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {items.map((t, i) => {
            const SourceIcon = brandIconMap[t.source];
            return (
              <Reveal as="li" key={t.id} delay={i * 0.07} className={cn("h-full", i % 2 === 1 && "xl:mt-10")}>
                <figure className="flex h-full flex-col rounded-[var(--radius-card)] bg-white p-6 shadow-soft ring-1 ring-line">
                  <div className="flex items-center justify-between">
                    <Stars value={t.rating} />
                    {SourceIcon ? (
                      <span className="text-ink-muted" title={`Review from ${t.source}`}>
                        <SourceIcon className="size-4" />
                        <span className="sr-only">Review from {t.source}</span>
                      </span>
                    ) : null}
                  </div>
                  <blockquote className="mt-5 flex-1 text-[1.02rem] leading-relaxed text-ink">“{t.quote}”</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-dashed border-line pt-5">
                    <span
                      aria-hidden="true"
                      className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-100 font-display text-sm font-bold text-brand-800"
                    >
                      {initialsOf(t.name)}
                    </span>
                    <span className="leading-tight">
                      <span className="block font-semibold text-ink">{t.name}</span>
                      <span className="text-sm text-ink-soft">
                        {t.relation} · {t.location}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
