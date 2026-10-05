import { Info } from "lucide-react";

/**
 * Renders typed content blocks (heading | paragraph | list | callout).
 * Same block schema the admin editor will store — no raw HTML, so no XSS surface.
 * Unknown block types are skipped rather than crashing the page.
 */
export default function ArticleBody({ blocks }) {
  return (
    <div className="text-[1.12rem] leading-[1.85] text-ink">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "heading":
            return (
              <h2 key={i} className="mt-12 mb-4 text-2xl font-semibold sm:text-[1.7rem]">
                {b.text}
              </h2>
            );
          case "paragraph":
            return (
              <p key={i} className="mt-5">
                {b.text}
              </p>
            );
          case "list":
            return (
              <ul key={i} className="mt-5 space-y-2.5">
                {b.items.map((it) => (
                  <li key={it} className="flex gap-3">
                    <span aria-hidden="true" className="mt-[0.85em] h-px w-3 shrink-0 bg-brand-500" />
                    {it}
                  </li>
                ))}
              </ul>
            );
          case "callout":
            return (
              <aside key={i} className="mt-8 flex gap-4 rounded-2xl bg-mist p-5 ring-1 ring-brand-100">
                <Info aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand-700" />
                <p className="leading-relaxed">{b.text}</p>
              </aside>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
