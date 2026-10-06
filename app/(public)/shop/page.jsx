import { Suspense } from "react";
import { shopData } from "@/data/shopData";
import { siteConfig } from "@/data/siteConfig";
import { buildMetadata } from "@/lib/seo";
import { getProductCategories, getProducts, getSeoConfig } from "@/services/content";
import PageHeader from "@/components/layout/PageHeader";
import ShopCatalog from "@/components/shop/ShopCatalog";

export async function generateMetadata() {
  return buildMetadata("shop", {}, await getSeoConfig());
}

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getProductCategories()]);
  const { header } = shopData;

  return (
    <>
      <PageHeader
        crumbs={[siteConfig.nav[0], { label: header.eyebrow, href: "/shop" }]}
        eyebrow={header.eyebrow}
        title={header.title}
        highlight={header.highlight}
        description={header.description}
      />
      <section aria-label={header.eyebrow} className="container-site py-12 sm:py-16">
        {/* useSearchParams (?upload=1, ?category=) → Suspense keeps the page statically rendered */}
        <Suspense fallback={<div className="h-[40rem] animate-pulse rounded-[1.25rem] bg-white/60" />}>
          <ShopCatalog products={products} categories={categories} />
        </Suspense>
      </section>
    </>
  );
}
