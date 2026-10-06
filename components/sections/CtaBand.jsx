import { Phone } from "lucide-react";
import { getSiteConfig } from "@/services/content";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";

/** Compact closing CTA used at the end of inner pages. */
export default async function CtaBand({ title, description, primary }) {
  const siteConfig = await getSiteConfig();
  return (
    <section aria-label={title} className="py-16 sm:py-24">
      <div className="container-site">
        <Reveal className="flex flex-col gap-8 rounded-[1.75rem] bg-brand-900 px-6 py-12 text-white sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:px-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl leading-tight font-semibold text-white sm:text-4xl">{title}</h2>
            {description ? <p className="mt-3 text-lg leading-relaxed text-brand-100">{description}</p> : null}
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Button href={primary.href} variant="light" size="lg" withArrow>
              {primary.label}
            </Button>
            <Button href={siteConfig.contact.phoneHref} variant="outlineLight" size="lg" icon={Phone}>
              {siteConfig.contact.phone}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
