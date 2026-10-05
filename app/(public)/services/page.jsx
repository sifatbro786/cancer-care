import { Check } from "lucide-react";
import { servicesPageData } from "@/data/servicesPageData";
import { homeData } from "@/data/homeData";
import { siteConfig } from "@/data/siteConfig";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { IconByKey } from "@/lib/icons";
import { getCareJourney, getServices } from "@/services/content";
import PageHeader from "@/components/layout/PageHeader";
import SmartImage from "@/components/ui/SmartImage";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import CareJourney from "@/components/home/CareJourney";
import CtaBand from "@/components/sections/CtaBand";

export const metadata = buildMetadata("services");

function DetailList({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="text-sm font-semibold tracking-wide text-ink-muted uppercase">{title}</h4>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it} className="flex gap-3 leading-relaxed text-ink-soft">
            <span aria-hidden="true" className="mt-3 h-px w-3 shrink-0 bg-brand-500" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function ServicesPage() {
  const [services, journey] = await Promise.all([getServices(), getCareJourney()]);
  const { header, labels, journey: journeyCopy, cta } = servicesPageData;

  return (
    <>
      <PageHeader
        crumbs={[siteConfig.nav[0], { label: header.eyebrow, href: "/services" }]}
        eyebrow={header.eyebrow}
        title={header.title}
        highlight={header.highlight}
        description={header.description}
      >
        <nav aria-label={labels.jumpTo} className="mt-10">
          <ul className="flex flex-wrap gap-2">
            {services.map((s) => (
              <li key={s.slug}>
                <a
                  href={`#${s.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink ring-1 ring-line transition-colors hover:text-brand-700 hover:ring-brand-300"
                >
                  <IconByKey name={s.icon} aria-hidden="true" className="size-4 text-brand-600" />
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      <div className="divide-y divide-line">
        {services.map((s, i) => {
          const flip = i % 2 === 1;
          const d = s.details;
          return (
            <section key={s.id} id={s.slug} aria-labelledby={`${s.slug}-title`} className="scroll-mt-28 py-20 sm:py-24">
              <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
                <Reveal className={cn("lg:col-span-5", flip && "lg:order-2")}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-mist lg:sticky lg:top-28 lg:aspect-[4/5]">
                    <SmartImage
                      src={s.image.src}
                      alt={s.image.alt}
                      fill
                      sizes="(min-width: 1024px) 38vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>

                <div className={cn("lg:col-span-7", flip && "lg:order-1")}>
                  <p aria-hidden="true" className="font-serif text-5xl text-brand-300 italic">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 id={`${s.slug}-title`} className="mt-3 text-3xl leading-tight font-semibold sm:text-4xl">
                    {s.title}
                  </h2>
                  <p className="mt-5 text-lg leading-relaxed text-ink-soft">{d.intro}</p>

                  <h3 className="mt-10 text-sm font-semibold tracking-wide text-ink-muted uppercase">{labels.highlights}</h3>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {s.highlights.map((h) => (
                      <li key={h} className="flex gap-3 rounded-xl bg-white p-4 ring-1 ring-line">
                        <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-600" />
                        <span className="leading-snug">{h}</span>
                      </li>
                    ))}
                  </ul>

                  {d.steps ? (
                    <div className="mt-10">
                      <h3 className="text-sm font-semibold tracking-wide text-ink-muted uppercase">{labels.steps}</h3>
                      <ol className="mt-4 space-y-3">
                        {d.steps.map((step, n) => (
                          <li key={step} className="flex gap-4">
                            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 font-display text-sm font-semibold text-brand-800 ring-1 ring-brand-100">
                              {n + 1}
                            </span>
                            <span className="pt-1 leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}

                  <div className="mt-10 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
                    <DetailList title={labels.precautions} items={d.precautions} />
                    <DetailList title={labels.facilities} items={d.facilities} />
                  </div>

                  <Button href={`/appointment?service=${s.slug}`} withArrow className="mt-10">
                    {labels.book}
                  </Button>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <CareJourney data={{ ...journeyCopy, images: homeData.journey.images }} steps={journey} />
      <CtaBand title={cta.title} description={cta.description} primary={cta.primary} />
    </>
  );
}
