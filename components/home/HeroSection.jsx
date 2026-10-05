import SmartImage from "@/components/ui/SmartImage";
import Button from "@/components/ui/Button";
import AccentText from "@/components/ui/AccentText";

const AVATAR_TONES = ["bg-brand-700", "bg-sage-500", "bg-brand-500", "bg-brand-900"];

/**
 * Hero — rounded photo card, copy anchored lower-left on a soft teal scrim.
 * Server component: no client JS. Entrance uses CSS keyframes (not Framer)
 * so the LCP text is painted immediately.
 */
export default function HeroSection({ data }) {
  const { eyebrow, title, highlight, description, primaryCta, secondaryCta, image, proof, trust } = data;

  return (
    <section aria-labelledby="hero-title" className="pt-4 pb-6 sm:pt-6">
      <div className="container-site">
        <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-brand-900 sm:rounded-[2.25rem]">
          <SmartImage
            src={image.src}
            alt={image.alt}
            fill
            preload
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="-z-20 object-cover object-[70%_center]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950/95 via-brand-950/70 to-brand-950/20 lg:bg-gradient-to-r lg:from-brand-950/90 lg:via-brand-950/55 lg:to-transparent"
          />

          <div className="grid min-h-[38rem] content-end px-6 pt-28 pb-24 sm:px-10 lg:min-h-[42rem] lg:px-14 lg:pb-28">
            <div className="hero-rise max-w-2xl">
              <p className="text-sm font-medium tracking-wide text-brand-100/90">{eyebrow}</p>

              <h1
                id="hero-title"
                className="mt-5 text-[2.6rem] leading-[1.04] font-semibold tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.4rem]"
              >
                <AccentText text={title} accent={highlight} className="text-brand-100" />
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-50/85">{description}</p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Button href={primaryCta.href} variant="light" size="lg" withArrow>
                  {primaryCta.label}
                </Button>
                <Button href={secondaryCta.href} variant="outlineLight" size="lg">
                  {secondaryCta.label}
                </Button>
              </div>
            </div>
          </div>

          {/* Proof — restrained glass card, hidden on small screens */}
          <div className="absolute right-6 bottom-24 hidden items-center gap-4 rounded-2xl bg-brand-950/55 py-3 pr-5 pl-3 text-white ring-1 ring-white/15 backdrop-blur-md md:flex lg:right-12 lg:bottom-28">
            <ul className="flex -space-x-2" aria-hidden="true">
              {proof.initials.map((ini, i) => (
                <li
                  key={ini}
                  className={`grid size-10 place-items-center rounded-full text-[0.7rem] font-semibold text-white ring-2 ring-white/80 ${AVATAR_TONES[i % AVATAR_TONES.length]}`}
                >
                  {ini}
                </li>
              ))}
            </ul>
            <p className="leading-tight">
              <span className="block font-display text-xl font-semibold">{proof.value}</span>
              <span className="text-sm text-brand-100">{proof.label}</span>
            </p>
          </div>

          {/* Trust rail */}
          <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-brand-950/50 backdrop-blur-sm">
            <div className="group overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
                {[0, 1].map((copy) => (
                  <ul
                    key={copy}
                    aria-hidden={copy === 1 ? "true" : undefined}
                    className="flex shrink-0 items-center gap-12 pr-12"
                  >
                    {trust.map((t) => (
                      <li key={t} className="flex items-center gap-4 text-sm whitespace-nowrap text-brand-100/90">
                        <span aria-hidden="true" className="h-3.5 w-px bg-brand-300/60" />
                        {t}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
