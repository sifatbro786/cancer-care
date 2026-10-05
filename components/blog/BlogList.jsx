"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import BlogCard from "@/components/blog/BlogCard";

/**
 * Client-side category filter. The full list is server-rendered into the HTML
 * (good for SEO, page stays static); filtering is instant with no round-trip.
 * Swap to `?category=` search params when the archive grows past ~50 posts.
 */
export default function BlogList({ posts, categories, labels }) {
  const [active, setActive] = useState("all");
  const labelOf = (key) => categories.find((c) => c.key === key)?.label ?? key;
  const visible = active === "all" ? posts : posts.filter((p) => p.category === active);
  const options = [{ key: "all", label: labels.allLabel }, ...categories];

  return (
    <>
      <div role="group" aria-label={labels.filterLabel} className="flex flex-wrap gap-2">
        {options.map((c) => (
          <button
            key={c.key}
            type="button"
            aria-pressed={active === c.key}
            onClick={() => setActive(c.key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium ring-1 transition-colors",
              active === c.key
                ? "bg-brand-700 text-white ring-brand-700"
                : "bg-white text-ink ring-line hover:text-brand-700 hover:ring-brand-300"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {visible.length} {labels.countLabel}
      </p>

      {visible.length ? (
        <ul className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => (
            <li key={post.id}>
              <BlogCard post={post} categoryLabel={labelOf(post.category)} minLabel={labels.minLabel} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-12 rounded-2xl bg-white p-8 text-center text-ink-soft ring-1 ring-line">{labels.emptyLabel}</p>
      )}
    </>
  );
}
