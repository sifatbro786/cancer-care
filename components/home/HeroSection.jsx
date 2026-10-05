import { Activity } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import Button from "@/components/ui/Button";
import HandUnderline from "@/components/ui/HandUnderline";

/**
 * Hero — rounded photo card with copy on a soft teal scrim (reference layout).
 * Server component: no client JS. Entrance uses CSS keyframes (not Framer)
 * so the LCP text is visible in the first paint.
 */
const AVATAR_TONES = ["bg-brand-600", "bg-brand-500", "bg-coral-500", "bg-sage-500"];

export default function HeroSection({ data }) {
  const { eyebrow, title, highlight, description, primaryCta, secondaryCta, image, note, proof, trust } = data;
  const [before, rest = ""] = title.split(highlight);
  const [, punct = "", after = ""] = rest.match(/^([.,;:!?]*)([\s\S]*)$/) ?? [];

  return (
    <section aria-labelledby="hero-title" className="pt-4 pb-6 sm:pt-6">
      <div className="container-site">
        <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-brand-900 shadow-lift sm:rounded-[2.25rem]">
          {/* Photo */}
          <SmartImage
            src={image.src}
            alt={image.alt}
            fill
            preload
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="-z-20 object-cover object-[70%_center]"
          />
          {/* Scrim: strong on the copy side, clear over the subject */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950/95 via-brand-950/75 to-brand-950/30 lg:bg-gradient-to-r lg:from-brand-950/95 lg:via-brand-950/70 lg:to-transparent"
          />

          <div className="grid min-h-[38rem] content-end gap-10 px-6 pt-28 pb-24 sm:px-10 lg:min-h-[41rem] lg:grid-cols-12 lg:content-center lg:px-14 lg:pt-16">
            <div className="hero-rise max-w-2xl lg:col-span-7">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-brand-100 ring-1 ring-white/15 backdrop-blur-sm">
                <Activity aria-hidden="true" className="size-3.5 text-coral-400" />
                {eyebrow}
              </p>

              <h1
                id="hero-title"
                className="mt-6 text-[2.5rem] leading-[1.06] font-semibold text-white sm:text-6xl lg:text-[4.25rem]"
              >
                {before}
                <span className="whitespace-nowrap">
                  <span className="relative inline-block text-brand-200">
                    {highlight}
                    <HandUnderline className="text-coral-400" />
                  </span>
                  {punct}
                </span>
                {after}
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-50/90">{description}</p>

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

          {/* Handwritten sticker (decorative) */}
          <p
            aria-hidden="true"
            className="absolute top-8 right-6 hidden rotate-[4deg] rounded-md bg-paper px-4 pt-3 pb-2 font-hand text-2xl leading-none text-brand-800 shadow-lg md:block lg:top-12 lg:right-12"
          >
            <span className="absolute -top-2.5 left-1/2 h-5 w-14 -translate-x-1/2 -rotate-3 bg-coral-200/80" />
            {note}
          </p>

          {/* Proof card */}
          <div className="absolute right-6 bottom-20 hidden items-center gap-4 rounded-2xl bg-white/95 py-3 pr-5 pl-3 shadow-lift backdrop-blur sm:flex lg:right-12 lg:bottom-24">
            <ul className="flex -space-x-2" aria-hidden="true">
              {proof.initials.map((ini, i) => (
                <li
                  key={ini}
                  className={`grid size-11 place-items-center rounded-full text-[0.7rem] font-bold text-white ring-2 ring-white ${AVATAR_TONES[i % AVATAR_TONES.length]}`}
                >
                  {ini}
                </li>
              ))}
            </ul>
            <p className="leading-tight">
              <span className="block font-display text-2xl font-bold text-ink">{proof.value}</span>
              <span className="text-sm text-ink-soft">{proof.label}</span>
            </p>
          </div>

          {/* Trust marquee */}
          <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-brand-950/60 backdrop-blur-sm">
            <div className="group overflow-hidden py-3.5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
              {[0, 1].map((copy) => (
                <ul
                  key={copy}
                  aria-hidden={copy === 1 ? "true" : undefined}
                  className="flex shrink-0 items-center gap-10 pr-10"
                >
                  {trust.map((t) => (
                    <li key={t} className="flex items-center gap-3 text-sm font-semibold whitespace-nowrap text-brand-100">
                      <span aria-hidden="true" className="size-1.5 rotate-45 bg-coral-400" />
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
