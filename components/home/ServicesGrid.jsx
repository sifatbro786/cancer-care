import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { IconByKey } from "@/lib/icons";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/ui/SmartImage";
import Reveal from "@/components/motion/Reveal";

/**
 * Services — heading column + 2×2 cards. A card fills teal on hover/focus
 * (the reference's highlighted card), and the whole card is one link target.
 */
export default function ServicesGrid({ data, services }) {
  const { eyebrow, title, highlight, description, cta, linkLabel } = data;

  return (
    <section aria-labelledby="services-title" className="py-20 sm:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHeading
              eyebrow={eyebrow}
              title={title}
              highlight={highlight}
              description={description}
              align="left"
              id="services-title"
            />
            <Button href={cta.href} withArrow className="mt-8">
              {cta.label}
            </Button>
          </div>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
          {services.map((s, i) => {
            return (
              <Reveal as="li" key={s.id} delay={(i % 2) * 0.08} className="h-full">
                <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-line transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:bg-brand-700 hover:shadow-lift focus-within:bg-brand-700 focus-within:shadow-lift">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <SmartImage
                      src={s.image.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                  </div>

<span className="relative z-10 -mt-7 ml-6 grid size-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg ring-4 ring-white transition-colors group-hover:bg-white group-hover:text-brand-700 group-hover:ring-brand-700 group-focus-within:bg-white group-focus-within:text-brand-700 group-focus-within:ring-brand-700">
                      <IconByKey name={s.icon} aria-hidden="true" className="size-6" />
                    </span>

                  <div className="flex flex-1 flex-col p-6 pt-4">
                    <h3 className="text-xl font-semibold transition-colors group-hover:text-white group-focus-within:text-white">
                      <Link
                        href={`/services#${s.slug}`}
                        className="outline-none after:absolute after:inset-0 after:content-['']"
                      >
                        {s.title}
                      </Link>
                    </h3>
                    <p className="mt-2 leading-relaxed text-ink-soft transition-colors group-hover:text-brand-100 group-focus-within:text-brand-100">
                      {s.short}
                    </p>
                    <ul className="mt-4 space-y-1.5 text-[0.92rem]">
                      {s.highlights.slice(0, 2).map((h) => (
                        <li
                          key={h}
                          className="flex items-start gap-2 text-ink-soft transition-colors group-hover:text-brand-50 group-focus-within:text-brand-50"
                        >
                          <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-500 group-hover:text-brand-200 group-focus-within:text-brand-200" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <span
                      aria-hidden="true"
                      className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-brand-700 transition-colors group-hover:text-white group-focus-within:text-white"
                    >
                      {linkLabel}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
