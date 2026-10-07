import Link from "next/link";
import { FileText } from "lucide-react";
import { IconByKey } from "@/lib/icons";
import { discountPercent, formatBDT } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/SectionHeading";
import AccentText from "@/components/ui/AccentText";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/ui/SmartImage";
import Reveal from "@/components/motion/Reveal";

/** Featured slugs first (in order), then top up from the catalogue — in-stock only. */
function pickProducts(products, slugs, count = 4) {
  const available = products.filter((p) => p.inStock);
  const bySlug = new Map(available.map((p) => [p.slug, p]));
  const picked = slugs.map((s) => bySlug.get(s)).filter(Boolean);
  for (const p of available) {
    if (picked.length >= count) break;
    if (!picked.includes(p)) picked.push(p);
  }
  return picked.slice(0, count);
}

function MiniProduct({ product: p, rxLabel, rxTitle }) {
  const off = discountPercent(p.price, p.mrp);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-line transition-shadow hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden bg-mist">
        <SmartImage
          src={p.image.src}
          alt={p.image.alt}
          fill
          sizes="(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {p.requiresPrescription ? (
          <span
            title={rxTitle}
            className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-semibold text-ink ring-1 ring-line"
          >
            <FileText aria-hidden="true" className="size-3 text-brand-700" />
            {rxLabel}
            <span className="sr-only">— {rxTitle}</span>
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="truncate text-xs text-ink-muted">{p.generic}</p>
        <h3 className="mt-0.5 text-base leading-snug font-semibold">
          <Link
            href={`/shop/${p.slug}`}
            className="outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-brand-700 focus-visible:underline"
          >
            {p.name}
          </Link>
        </h3>
        <p className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="font-display text-lg font-semibold">{formatBDT(p.price)}</span>
          {off ? <s className="text-sm text-ink-muted">{formatBDT(p.mrp)}</s> : null}
        </p>
      </div>
    </article>
  );
}

/**
 * Homepage medicine-shop highlight: why order here + 3-step ordering flow on the
 * left, a few real catalogue items on the right. Products come from the same
 * source as /shop (mock or DB), so prices/stock are never duplicated in copy.
 */
export default function MedicineShopSection({ data, products }) {
  const { eyebrow, title, highlight, description, steps, primaryCta, secondaryCta, productsHeading } = data;
  const featured = pickProducts(products, data.featuredSlugs);

  return (
    <section aria-labelledby="shop-highlight-title" className="pb-4 sm:pb-8">
      <div className="container-site">
        <div className="grid gap-12 rounded-[2rem] bg-paper-deep px-6 py-12 sm:px-12 lg:grid-cols-12 lg:gap-14 lg:px-14 lg:py-16">
          <Reveal className="lg:col-span-5">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2
              id="shop-highlight-title"
              className="mt-4 text-3xl leading-[1.12] font-semibold sm:text-4xl lg:text-[2.6rem]"
            >
              <AccentText text={title} accent={highlight} />
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">{description}</p>

            <ol className="mt-8 space-y-4">
              {steps.map((s) => (
                <li key={s.title} className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-brand-700 ring-1 ring-line">
                    <IconByKey name={s.icon} aria-hidden="true" className="size-5" />
                  </span>
                  <p className="pt-0.5 leading-snug">
                    <span className="block font-display font-semibold text-ink">{s.title}</span>
                    <span className="text-[0.95rem] text-ink-soft">{s.text}</span>
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button href={primaryCta.href} withArrow>
                {primaryCta.label}
              </Button>
              <Button href={secondaryCta.href} variant="secondary">
                {secondaryCta.label}
              </Button>
            </div>
          </Reveal>

          {featured.length ? (
            <Reveal delay={0.08} className="flex flex-col justify-center lg:col-span-7">
              <p className="font-display text-sm font-semibold tracking-[0.16em] text-ink-muted uppercase">
                {productsHeading}
              </p>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {featured.map((p) => (
                  <li key={p.id ?? p.slug}>
                    <MiniProduct product={p} rxLabel={data.rxLabel} rxTitle={data.rxTitle} />
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
