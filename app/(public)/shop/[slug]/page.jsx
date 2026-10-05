import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Info, Snowflake, Truck } from "lucide-react";
import { shopData } from "@/data/shopData";
import { siteConfig } from "@/data/siteConfig";
import { breadcrumbJsonLd, buildMetadata, productJsonLd } from "@/lib/seo";
import { discountPercent, formatBDT } from "@/lib/utils";
import { getAllProductSlugs, getProductBySlug, getProductCategories, getProducts } from "@/services/content";
import SmartImage from "@/components/ui/SmartImage";
import JsonLd from "@/components/seo/JsonLd";
import ProductActions from "@/components/shop/ProductActions";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllProductSlugs();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  return buildMetadata(null, {
    title: `${p.name} — ${p.generic}`,
    description: p.description,
    path: `/shop/${p.slug}`,
    image: p.image,
  });
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();

  const [categories, sameCategory] = await Promise.all([
    getProductCategories(),
    getProducts({ category: p.category }),
  ]);
  const D = shopData.detail;
  const off = discountPercent(p.price, p.mrp);
  const categoryLabel = categories.find((c) => c.key === p.category)?.label;
  const related = sameCategory.filter((x) => x.slug !== p.slug).slice(0, 3);
  const crumbs = [
    siteConfig.nav[0],
    { label: shopData.header.eyebrow, href: "/shop" },
    { label: p.name, href: `/shop/${p.slug}` },
  ];

  const facts = [
    [D.generic, p.generic],
    [D.manufacturer, p.manufacturer],
    [D.pack, p.pack],
  ];

  return (
    <>
      <div className="container-site pt-10 sm:pt-14">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-brand-700">
          <ArrowLeft aria-hidden="true" className="size-4" />
          {D.back}
        </Link>
      </div>

      <section aria-labelledby="product-title" className="container-site grid gap-10 py-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-mist ring-1 ring-line">
          <SmartImage src={p.image.src} alt={p.image.alt} fill preload sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        </div>

        <div>
          <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">{categoryLabel}</p>
          <h1 id="product-title" className="mt-3 text-4xl leading-tight font-semibold tracking-[-0.02em]">
            {p.name}
          </h1>
          <p className="mt-2 text-lg text-ink-soft">{p.generic}</p>

          <p className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl font-semibold">{formatBDT(p.price)}</span>
            {off ? (
              <>
                <span className="text-ink-muted">
                  {D.mrp} <s>{formatBDT(p.mrp)}</s>
                </span>
                <span className="font-semibold text-brand-700">
                  {off}% {shopData.card.off}
                </span>
              </>
            ) : null}
          </p>

          <p className="mt-6 text-lg leading-relaxed">{p.description}</p>

          <dl className="mt-8 divide-y divide-line border-y border-line">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 py-3">
                <dt className="text-sm font-semibold text-ink-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-6 space-y-3 text-[0.95rem]">
            {p.requiresPrescription ? (
              <li className="flex gap-3 rounded-xl bg-white p-4 ring-1 ring-line">
                <FileText aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-700" />
                {D.rxNote}
              </li>
            ) : null}
            {p.coldChain ? (
              <li className="flex gap-3 rounded-xl bg-white p-4 ring-1 ring-line">
                <Snowflake aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-700" />
                {D.coldNote}
              </li>
            ) : null}
            <li className="flex gap-3 rounded-xl bg-white p-4 ring-1 ring-line">
              <Truck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-700" />
              {D.deliveryNote}
            </li>
          </ul>

          <div className="mt-8">
            <ProductActions product={p} />
          </div>

          <p className="mt-8 flex gap-2 text-sm text-ink-muted">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {D.disclaimer}
          </p>
        </div>
      </section>

      {related.length ? (
        <section aria-labelledby="related-products" className="border-t border-line bg-white py-16">
          <div className="container-site">
            <h2 id="related-products" className="text-2xl font-semibold">
              {categoryLabel}
            </h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  {/* Server-rendered card: ordering happens on the product's own page */}
                  <RelatedCard product={r} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <JsonLd data={[productJsonLd(p), breadcrumbJsonLd(crumbs)]} />
    </>
  );
}

/** ProductCard needs an onOrder handler (client); related items just link through. */
function RelatedCard({ product }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex items-center gap-4 rounded-[1.25rem] bg-paper p-3 ring-1 ring-line transition-shadow hover:shadow-lift"
    >
      <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-mist">
        <SmartImage src={product.image.src} alt="" fill sizes="80px" className="object-cover" />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold group-hover:text-brand-700">{product.name}</span>
        <span className="block text-sm text-ink-muted">{product.pack}</span>
        <span className="mt-1 block font-display font-semibold">{formatBDT(product.price)}</span>
      </span>
    </Link>
  );
}
