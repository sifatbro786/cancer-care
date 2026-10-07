import { Info, Mail, Phone } from "lucide-react";
import { legalData } from "@/data/legalData";
import { formatDate } from "@/lib/utils";
import PageHeader from "@/components/layout/PageHeader";

/**
 * Shared layout for Privacy Policy / Terms of Use: sticky table of contents,
 * numbered sections, contact card. Pure server component, print-friendly.
 * `doc` = legalData.privacy | legalData.terms; `site` = live site config.
 */
export default function LegalDocument({ doc, site, crumbHref }) {
  const L = legalData;
  const disclaimer = site.footer?.disclaimer;

  return (
    <>
      <PageHeader
        crumbs={[site.nav[0], { label: doc.title, href: crumbHref }]}
        eyebrow={L.eyebrow}
        title={doc.title}
        highlight={doc.highlight}
        description={doc.description}
      >
        <p className="mt-6 text-sm text-ink-muted">
          {L.updatedLabel}: <time dateTime={doc.updated}>{formatDate(doc.updated)}</time>
        </p>
      </PageHeader>

      <div className="container-site grid gap-12 py-14 sm:py-20 lg:grid-cols-12 lg:gap-16">
        <nav aria-labelledby="legal-toc" className="lg:col-span-4 xl:col-span-3 print:hidden">
          <div className="lg:sticky lg:top-32">
            <p id="legal-toc" className="font-display text-sm font-semibold tracking-[0.16em] text-ink-muted uppercase">
              {L.tocLabel}
            </p>
            <ol className="mt-4 space-y-1 border-l border-line">
              {doc.sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="-ml-px flex gap-3 border-l-2 border-transparent py-1.5 pl-4 text-[0.95rem] text-ink-soft transition-colors hover:border-brand-500 hover:text-ink"
                  >
                    <span className="w-5 shrink-0 font-display font-semibold text-ink-quiet tabular-nums">{i + 1}.</span>
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <article className="max-w-3xl lg:col-span-8">
          {doc.sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-title`}
              className="border-b border-line py-9 first:pt-0 last:border-b-0"
            >
              <h2 id={`${s.id}-title`} className="flex gap-3 text-2xl leading-snug font-semibold">
                <span className="font-display text-ink-quiet tabular-nums">{i + 1}.</span>
                {s.heading}
              </h2>

              {s.calloutFromSettings && disclaimer ? (
                <p className="mt-5 flex gap-3 rounded-xl bg-brand-50 p-4 leading-relaxed text-brand-950 ring-1 ring-brand-100">
                  <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-700" />
                  {disclaimer}
                </p>
              ) : null}

              <div className="mt-4 space-y-4 text-[1.05rem] leading-[1.75] text-ink-soft">
                {s.blocks.map((b, j) =>
                  b.list ? (
                    <ul key={j} className="space-y-2.5">
                      {b.list.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span aria-hidden="true" className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-brand-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j}>{b.p}</p>
                  )
                )}
              </div>
            </section>
          ))}

          <aside className="mt-10 rounded-[1.25rem] bg-white p-6 ring-1 ring-line sm:p-8">
            <h2 className="text-xl font-semibold">{L.contact.heading}</h2>
            <p className="mt-2 text-ink-soft">{L.contact.text}</p>
            <ul className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
              <li>
                <a href={site.contact.phoneHref} className="inline-flex items-center gap-2 font-semibold text-brand-700 hover:underline">
                  <Phone aria-hidden="true" className="size-4" />
                  {site.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={site.contact.emailHref}
                  className="inline-flex items-center gap-2 font-semibold text-brand-700 [overflow-wrap:anywhere] hover:underline"
                >
                  <Mail aria-hidden="true" className="size-4" />
                  {site.contact.email}
                </a>
              </li>
            </ul>
            <p className="mt-4 text-sm text-ink-muted">{site.address.full}</p>
          </aside>
        </article>
      </div>
    </>
  );
}
