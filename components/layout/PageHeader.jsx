import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { breadcrumbJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/SectionHeading";
import AccentText from "@/components/ui/AccentText";
import SmartImage from "@/components/ui/SmartImage";
import JsonLd from "@/components/seo/JsonLd";

/**
 * Inner-page header: breadcrumb (+ BreadcrumbList JSON-LD), eyebrow, H1 with
 * serif accent, lead paragraph and an optional portrait-crop image.
 * `crumbs` = [{ label, href }] — the last item is the current page.
 */
export default function PageHeader({ crumbs, eyebrow, title, highlight, description, image, children }) {
  return (
    <header className="border-b border-line">
      <div
        className={cn(
          "container-site grid gap-10 pt-10 pb-14 sm:pt-14 sm:pb-20",
          image && "lg:grid-cols-12 lg:items-end lg:gap-16"
        )}
      >
        <div className={cn(image ? "lg:col-span-7" : "max-w-3xl")}>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
              {crumbs.map((c, i) => {
                const last = i === crumbs.length - 1;
                return (
                  <li key={c.href} className="flex items-center gap-1.5">
                    {last ? (
                      <span aria-current="page" className="text-ink">
                        {c.label}
                      </span>
                    ) : (
                      <>
                        <Link href={c.href} className="hover:text-brand-700 hover:underline">
                          {c.label}
                        </Link>
                        <ChevronRight aria-hidden="true" className="size-3.5" />
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <Eyebrow className="mt-10">{eyebrow}</Eyebrow>
          <h1 className="mt-5 text-4xl leading-[1.06] font-semibold tracking-[-0.03em] sm:text-5xl lg:text-[3.6rem]">
            <AccentText text={title} accent={highlight} className="text-brand-700" />
          </h1>
          {description ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{description}</p> : null}
          {children}
        </div>

        {image ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-mist lg:col-span-5 lg:aspect-[4/5]">
            <SmartImage
              src={image.src}
              alt={image.alt}
              fill
              preload
              sizes="(min-width: 1024px) 36vw, 100vw"
              className="object-cover object-top"
            />
          </div>
        ) : null}
      </div>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </header>
  );
}
