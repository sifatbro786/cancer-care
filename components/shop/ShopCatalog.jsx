"use client";

import { useDeferredValue, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Upload, X } from "lucide-react";
import { shopData } from "@/data/shopData";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/shop/ProductCard";
import PrescriptionUploadModal from "@/components/shop/PrescriptionUploadModal";
import Button from "@/components/ui/Button";

/**
 * Client catalogue: search + category filter + order modal.
 * Products are server-rendered into the HTML (SEO), filtering is instant.
 * `?upload=1` (from footer / CTAs) opens the general prescription upload.
 * Backend phase: when the catalogue grows, move filtering to the server
 * via `?q=&category=` and paginate — the props contract stays the same.
 */
export default function ShopCatalog({ products, categories }) {
  const S = shopData;
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(() => {
    const c = params.get("category");
    return categories.some((x) => x.key === c) ? c : "all";
  });
  const [modal, setModal] = useState(() => ({ open: params.get("upload") === "1", product: null }));
  const deferredQuery = useDeferredValue(query);

  const term = deferredQuery.trim().toLowerCase();
  const visible = products.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      (!term || p.name.toLowerCase().includes(term) || p.generic.toLowerCase().includes(term))
  );

  const openOrder = (product) => setModal({ open: true, product });
  const closeModal = () => {
    setModal((m) => ({ ...m, open: false }));
    // Drop ?upload=1 so a refresh/back doesn't reopen the modal
    if (params.get("upload")) router.replace(pathname, { scroll: false });
  };
  const clear = () => {
    setQuery("");
    setCategory("all");
  };

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <label htmlFor="shop-search" className="sr-only">
            {S.searchLabel}
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" />
          <input
            id="shop-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={S.searchPlaceholder}
            autoComplete="off"
            className="h-12 w-full rounded-xl bg-white pr-4 pl-12 text-base ring-1 ring-line outline-none placeholder:text-ink-muted/70 focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div role="group" aria-label={S.filterLabel} className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              aria-pressed={category === c.key}
              onClick={() => setCategory(c.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium ring-1 transition-colors",
                category === c.key
                  ? "bg-brand-700 text-white ring-brand-700"
                  : "bg-white text-ink ring-line hover:text-brand-700 hover:ring-brand-300"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-[1.25rem] bg-brand-900 p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="font-display text-lg font-semibold">{S.uploadBanner.title}</p>
          <p className="text-brand-100">{S.uploadBanner.text}</p>
        </div>
        <Button variant="light" icon={Upload} onClick={() => openOrder(null)} className="shrink-0">
          {S.uploadBanner.cta}
        </Button>
      </div>

      <p aria-live="polite" className="mt-10 text-sm text-ink-muted">
        {S.resultsLabel(visible.length)}
      </p>

      {visible.length ? (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} onOrder={openOrder} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-[1.25rem] bg-white p-10 text-center ring-1 ring-line">
          <p className="text-xl font-semibold">{S.emptyTitle}</p>
          <p className="mx-auto mt-2 max-w-md text-ink-soft">{S.emptyText}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="secondary" icon={X} onClick={clear}>
              {S.clearLabel}
            </Button>
            <Button icon={Upload} onClick={() => openOrder(null)}>
              {S.uploadBanner.cta}
            </Button>
          </div>
        </div>
      )}

      <PrescriptionUploadModal open={modal.open} product={modal.product} onClose={closeModal} />
    </>
  );
}
