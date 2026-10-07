import { IconByKey } from "@/lib/icons";
import { cn } from "@/lib/utils";
import SectionHeading from "@/components/ui/SectionHeading";
import SmartImage from "@/components/ui/SmartImage";
import Reveal from "@/components/motion/Reveal";

/**
 * 3-step patient journey — classic horizontal stepper.
 * Photo on top, then a marker row: icon badge + a straight connector that runs
 * badge-to-badge through the empty band *below* the photos (never behind them).
 * Connector is a pseudo-element of the marker row, so it always matches the
 * grid gap at every width — no absolutely positioned SVG to drift.
 */
export default function CareJourney({ data, steps }) {
  const { eyebrow, title, highlight, stepLabel, images } = data;
  const last = steps.length - 1;

  return (
    <section aria-labelledby="journey-title" className="bg-brand-50/60 py-20 sm:py-28">
      <div className="container-site">
        <SectionHeading id="journey-title" eyebrow={eyebrow} title={title} highlight={highlight} />

        <ol className="mt-14 grid gap-12 md:mt-16 md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => (
            <Reveal as="li" key={step.step} delay={i * 0.1} className="flex flex-col items-center text-center">
              <div className="relative h-56 w-full overflow-hidden rounded-[1.5rem] shadow-soft lg:h-60">
                <SmartImage
                  src={images[i].src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="object-cover"
                />
              </div>

              {/* Marker row — connector runs from this badge's edge to the next badge's edge (md+) */}
              <div
                className={cn(
                  "relative mt-7 flex w-full justify-center",
                  i < last &&
                    "md:after:absolute md:after:top-1/2 md:after:left-[calc(50%+2.5rem)] md:after:h-0.5 md:after:w-[calc(100%-5rem+2rem)] md:after:-translate-y-1/2 md:after:rounded-full md:after:bg-brand-200 md:after:content-['']"
                )}
              >
                <span
                  className={cn(
                    "grid size-14 place-items-center rounded-2xl text-white shadow-soft",
                    i === 1 ? "bg-brand-900" : "bg-brand-600"
                  )}
                >
                  <IconByKey name={step.icon} aria-hidden="true" className="size-6" />
                </span>
              </div>

              <p className="mt-5 font-display text-xs font-semibold tracking-[0.16em] text-brand-700 uppercase tabular-nums">
                {stepLabel} {step.step}
              </p>
              <h3 className="mt-2 max-w-xs text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 max-w-sm leading-relaxed text-ink-soft">{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
