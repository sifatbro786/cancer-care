import Link from "next/link";
import { FileText, Snowflake } from "lucide-react";
import { shopData } from "@/data/shopData";
import { cn, discountPercent, formatBDT } from "@/lib/utils";
import SmartImage from "@/components/ui/SmartImage";
import Button from "@/components/ui/Button";

/** Product tile. `onOrder(product)` opens the order / prescription modal. */
export default function ProductCard({ product: p, onOrder }) {
  const C = shopData.card;
  const off = discountPercent(p.price, p.mrp);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white ring-1 ring-line transition-shadow hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-mist">
        <SmartImage
          src={p.image.src}
          alt={p.image.alt}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {p.requiresPrescription ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink ring-1 ring-line">
              <FileText aria-hidden="true" className="size-3.5 text-brand-700" />
              {C.rx}
            </span>
          ) : null}
          {p.coldChain ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink ring-1 ring-line">
              <Snowflake aria-hidden="true" className="size-3.5 text-brand-700" />
              {C.coldChain}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-ink-muted">{p.generic}</p>
        <h3 className="mt-1 text-lg leading-snug font-semibold">
          <Link href={`/shop/${p.slug}`} className="outline-none after:absolute after:inset-0 after:content-[''] hover:text-brand-700 focus-visible:underline">
            {p.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-ink-soft">{p.pack}</p>

        <p className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold">{formatBDT(p.price)}</span>
          {off ? (
            <>
              <s className="text-sm text-ink-muted">{formatBDT(p.mrp)}</s>
              <span className="text-sm font-semibold text-brand-700">
                {off}% {C.off}
              </span>
            </>
          ) : null}
        </p>

        <div className="relative z-10 mt-auto pt-5">
          {p.inStock ? (
            <Button
              size="sm"
              variant={p.requiresPrescription ? "primary" : "secondary"}
              className="w-full"
              onClick={() => onOrder(p)}
            >
              {p.requiresPrescription ? C.orderRx : C.order}
            </Button>
          ) : (
            <p className={cn("rounded-xl bg-paper-deep py-2.5 text-center text-sm font-medium text-ink-muted")}>{C.outOfStock}</p>
          )}
        </div>
      </div>
    </article>
  );
}
