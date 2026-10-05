import { Eyebrow } from "@/components/ui/SectionHeading";
import SmartImage from "@/components/ui/SmartImage";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";

export default function FinalCta({ data }) {
  const { eyebrow, title, description, primary, secondary, image } = data;

  return (
    <section aria-labelledby="final-cta-title" className="pt-6 pb-20 sm:pb-28">
      <div className="container-site">
        <Reveal className="relative isolate overflow-hidden rounded-[2rem] px-6 py-16 sm:px-12 lg:px-16 lg:py-24">
          <SmartImage src={image.src} alt="" fill sizes="(min-width: 1280px) 1280px, 100vw" className="-z-20 object-cover" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/95 via-brand-900/80 to-brand-900/30" />

          <div className="max-w-2xl">
            <Eyebrow invert>{eyebrow}</Eyebrow>
            <h2 id="final-cta-title" className="mt-5 text-3xl leading-tight font-semibold text-white sm:text-5xl">
              {title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-brand-50/90">{description}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href={primary.href} variant="light" size="lg" withArrow>
                {primary.label}
              </Button>
              <Button href={secondary.href} variant="outlineLight" size="lg">
                {secondary.label}
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
