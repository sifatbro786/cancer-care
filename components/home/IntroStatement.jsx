import { HeartPulse } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import Reveal from "@/components/motion/Reveal";

/** Editorial statement + quiet stats (no count-up gimmicks) + photo. */
export default function IntroStatement({ data, stats }) {
  const { eyebrow, statement, highlight, handNote, image } = data;
  const [before, after = ""] = statement.split(highlight);

  return (
    <section aria-labelledby="intro-title" className="py-16 sm:py-24">
      <div className="container-site">
        <div className="bg-grain grid gap-12 rounded-[2rem] bg-white px-6 py-12 ring-1 ring-line sm:px-12 lg:grid-cols-12 lg:gap-16 lg:px-16 lg:py-16">
          <Reveal className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-brand-700 uppercase">
              <HeartPulse aria-hidden="true" className="size-4" />
              {eyebrow}
            </p>
            <h2
              id="intro-title"
              className="mt-5 text-2xl leading-[1.35] font-medium text-ink sm:text-[2rem] sm:leading-[1.3]"
            >
              {before}
              <span className="text-brand-600">{highlight}</span>
              {after}
            </h2>

            <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-line pt-8 sm:gap-8">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dt className="order-2 mt-2 text-sm leading-snug text-ink-soft">{s.label}</dt>
                  <dd className="order-1 font-display text-3xl font-semibold tracking-tight text-ink sm:text-[2.6rem]">
                    {s.value.toLocaleString("en-US")}
                    <span className="text-brand-500">{s.suffix}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p aria-hidden="true" className="mt-5 -rotate-1 font-hand text-xl text-coral-600">
              ↑ {handNote}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="relative lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-auto lg:h-full lg:min-h-80">
              <SmartImage
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
