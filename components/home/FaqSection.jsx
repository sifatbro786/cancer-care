import { Phone, Plus } from "lucide-react";
import { getSiteConfig } from "@/services/content";
import { whatsappLink } from "@/lib/site";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import { WhatsappIcon } from "@/components/icons/BrandIcons";

/**
 * FAQ accordion on native <details>/<summary>:
 * zero JS, keyboard & screen-reader accessible, works before hydration,
 * and content stays in the HTML for search engines.
 */
export default async function FaqSection({ data, faqs }) {
  const siteConfig = await getSiteConfig();
  const whatsappHref = whatsappLink(siteConfig.contact);
  const { eyebrow, title, highlight, description } = data;

  return (
    <section aria-labelledby="faq-title" className="bg-paper-deep/60 py-20 sm:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHeading
              id="faq-title"
              eyebrow={eyebrow}
              title={title}
              highlight={highlight}
              description={description}
              align="left"
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={siteConfig.contact.phoneHref} icon={Phone}>
                {siteConfig.contact.phone}
              </Button>
              <Button href={whatsappHref} variant="secondary" icon={WhatsappIcon}>
                WhatsApp
              </Button>
            </div>
          </div>
        </div>

        <Reveal className="lg:col-span-7">
          <ul className="space-y-3">
            {faqs.map((f, i) => (
              <li key={f.q}>
                <details
                  name="home-faq"
                  open={i === 0}
                  className="group rounded-2xl bg-white ring-1 ring-line transition-shadow open:shadow-soft open:ring-brand-200"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-2xl px-6 py-5 font-display text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span
                      aria-hidden="true"
                      className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-transform duration-300 group-open:rotate-45 group-open:bg-brand-600 group-open:text-white"
                    >
                      <Plus className="size-4" />
                    </span>
                  </summary>
                  <p className="px-6 pb-6 -mt-1 leading-relaxed text-ink-soft">{f.a}</p>
                </details>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
