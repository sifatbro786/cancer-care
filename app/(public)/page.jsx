import { siteConfig } from "@/data/siteConfig";
import { seoData } from "@/data/seoData";
import { buildMetadata } from "@/lib/seo";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export const metadata = buildMetadata("home");

/**
 * Phase 1 placeholder — verifies the design system & layout shell.
 * Replaced by the full homepage (Hero, Doctor, Services, Journey,
 * Testimonials, Emergency banner, Blog, FAQ) in Phase 2.
 */
export default function HomePage() {
  return (
    <section className="bg-chart relative py-24 sm:py-32">
      <div className="container-site flex flex-col items-center gap-8">
        <Badge tone="coral">Phase 1 · Foundation preview</Badge>
        <SectionHeading
          as="h1"
          eyebrow={siteConfig.name}
          title={siteConfig.tagline}
          highlight="cancer care"
          description={seoData.default.description}
        />
        <div className="flex flex-wrap justify-center gap-3">
          <Button href={siteConfig.cta.primary.href} size="lg" withArrow>
            {siteConfig.cta.primary.label}
          </Button>
          <Button href={siteConfig.cta.secondary.href} size="lg" variant="secondary">
            {siteConfig.cta.secondary.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
