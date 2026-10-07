import { aboutData } from "@/data/aboutData";
import { formatNumber } from "@/lib/utils";
import { siteConfig } from "@/data/siteConfig";
import { buildMetadata } from "@/lib/seo";
import { getDoctor, getSeoConfig, withSlots } from "@/services/content";
import PageHeader from "@/components/layout/PageHeader";
import SectionHeading from "@/components/ui/SectionHeading";
import SmartImage from "@/components/ui/SmartImage";
import Reveal from "@/components/motion/Reveal";
import CtaBand from "@/components/sections/CtaBand";

export async function generateMetadata() {
  return buildMetadata("about", {}, await getSeoConfig());
}

export default async function AboutPage() {
  const [doctor, about] = await Promise.all([getDoctor(), withSlots(aboutData)]);
  const { header, bio, timeline, affiliations, memberships, focus, gallery, cta } = about;
  const home = siteConfig.nav[0];

  return (
    <>
      <PageHeader
        crumbs={[home, { label: header.eyebrow, href: "/about" }]}
        eyebrow={header.eyebrow}
        title={header.title}
        highlight={header.highlight}
        description={header.description}
        image={header.image}
      >
        <dl className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-line pt-6">
          {doctor.stats.map((s) => (
            <div key={s.label} className="flex flex-col">
              <dt className="order-2 mt-1 text-sm leading-snug text-ink-muted">{s.label}</dt>
              <dd className="order-1 font-display text-3xl font-semibold tracking-tight">
                {formatNumber(s.value)}
                {s.suffix}
              </dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      {/* Biography */}
      <section aria-labelledby="bio-title" className="py-20 sm:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <SectionHeading id="bio-title" eyebrow={bio.eyebrow} title={bio.title} align="left" />
            <p className="mt-6 text-ink-soft">{doctor.name}</p>
            <p className="text-ink-soft">{doctor.degrees.join(" · ")}</p>
          </div>
          <Reveal className="space-y-6 text-lg leading-[1.8] text-ink lg:col-span-8">
            {doctor.bio.map((para, i) => (
              <p key={i}>
                {para}
              </p>
            ))}
            <blockquote className="border-l-2 border-brand-500 pl-6">
              <p className="font-display text-2xl leading-snug font-medium tracking-[-0.01em]">“{doctor.philosophy.quote}”</p>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* Affiliations + training */}
      <section aria-labelledby="training-title" className="border-y border-line bg-white py-20 sm:py-24">
        <div className="container-site grid gap-16 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={affiliations.eyebrow} title={affiliations.title} align="left" />
            <ul className="mt-10 divide-y divide-line border-y border-line">
              {doctor.affiliations.map((a) => (
                <li key={a.name} className="grid gap-1 py-5 sm:grid-cols-[7rem_1fr] sm:gap-6">
                  <span className="text-sm font-semibold text-ink-muted">{a.period}</span>
                  <span>
                    <span className="block font-display text-lg font-semibold">{a.name}</span>
                    <span className="text-ink-soft">{a.role}</span>
                  </span>
                </li>
              ))}
            </ul>

            <h3 className="mt-12 text-lg font-semibold">{memberships.title}</h3>
            <ul className="mt-4 space-y-2 text-ink-soft">
              {doctor.memberships.map((m) => (
                <li key={m} className="flex gap-3">
                  <span aria-hidden="true" className="mt-3 h-px w-4 shrink-0 bg-brand-500" />
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHeading id="training-title" eyebrow={timeline.eyebrow} title={timeline.title} align="left" />
            <ol className="relative mt-10 space-y-8 border-l border-line pl-8">
              {doctor.training.map((t) => (
                <li key={t.title} className="relative">
                  <span aria-hidden="true" className="absolute top-2 -left-[2.3rem] size-2.5 rounded-full bg-brand-600 ring-4 ring-white" />
                  <p className="font-display text-sm font-semibold tracking-[0.12em] text-brand-700 tabular-nums">{t.year}</p>
                  <p className="mt-1 font-display text-lg font-semibold">{t.title}</p>
                  {t.place && !t.place.startsWith("TODO") ? <p className="text-ink-soft">{t.place}</p> : null}
                </li>
              ))}
            </ol>

            <h3 className="mt-12 text-lg font-semibold">{focus.title}</h3>
            <p className="mt-3 leading-relaxed text-ink-soft">{doctor.specialties.join(" · ")}</p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section aria-labelledby="gallery-title" className="py-20 sm:py-24">
        <div className="container-site">
          <SectionHeading
            id="gallery-title"
            eyebrow={gallery.eyebrow}
            title={gallery.title}
            description={gallery.description}
            align="left"
          />
          <ul className="mt-12 grid auto-rows-[14rem] gap-4 sm:grid-cols-2 lg:auto-rows-[16rem] lg:grid-cols-4">
            {gallery.images.map((img, i) => (
              <Reveal
                as="li"
                key={img.src}
                delay={i * 0.05}
                className={i === 0 ? "sm:col-span-2 sm:row-span-2" : undefined}
              >
                <figure className="group relative h-full overflow-hidden rounded-2xl bg-mist">
                  <SmartImage
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <figcaption className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-ink backdrop-blur">
                    {img.caption}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand title={cta.title} primary={cta.primary} />
    </>
  );
}
