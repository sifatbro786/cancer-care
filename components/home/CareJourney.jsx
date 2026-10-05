import { IconByKey } from "@/lib/icons";
import { cn } from "@/lib/utils";
import SectionHeading from "@/components/ui/SectionHeading";
import SmartImage from "@/components/ui/SmartImage";
import Reveal from "@/components/motion/Reveal";

/** 3-step patient journey with a hand-drawn connector between steps (desktop). */
export default function CareJourney({ data, steps }) {
  const { eyebrow, title, highlight, images } = data;

  return (
    <section aria-labelledby="journey-title" className="bg-brand-50/60 py-20 sm:py-28">
      <div className="container-site">
        <SectionHeading id="journey-title" eyebrow={eyebrow} title={title} highlight={highlight} />

        <div className="relative mt-16">
          {/* Connector — decorative dashed curve behind the step badges */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 60"
            preserveAspectRatio="none"
            className="pointer-events-none absolute top-[13.25rem] left-[16%] z-0 hidden h-14 w-[68%] text-brand-300 md:block"
          >
            <path
              d="M0 40 C 160 0, 340 0, 500 30 S 840 60, 1000 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="8 10"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => {
            const featured = i === 1;
            return (
              <Reveal as="li" key={step.step} delay={i * 0.1} className="relative flex flex-col items-center text-center">
                <div className="relative h-60 w-full overflow-hidden rounded-[1.5rem] shadow-soft">
                  <SmartImage
                    src={images[i].src}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 font-hand text-xl leading-none text-brand-800"
                  >
                    step {step.step}
                  </span>
                </div>

                <span
                  className={cn(
                    "relative z-10 -mt-7 grid size-14 place-items-center rounded-2xl text-white shadow-lg ring-4 ring-brand-50",
                    featured ? "bg-coral-600" : "bg-brand-600"
                  )}
                >
                  <IconByKey name={step.icon} aria-hidden="true" className="size-6" />
                </span>

                <h3 className={cn("mt-5 max-w-xs text-xl font-semibold", featured && "text-coral-700")}>
                  <span className="sr-only">Step {step.step}: </span>
                  {step.title}
                </h3>
                <p className="mt-2 max-w-sm leading-relaxed text-ink-soft">{step.text}</p>
              </Reveal>
            );
          })}
          </ol>
        </div>
      </div>
    </section>
  );
}
