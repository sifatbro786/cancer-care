import { CircleCheck, Phone, TriangleAlert } from "lucide-react";
import { patientGuideData } from "@/data/patientGuideData";
import { getSeoConfig, getSiteConfig, withSlots } from "@/services/content";
import { buildMetadata } from "@/lib/seo";
import PageHeader from "@/components/layout/PageHeader";
import SmartImage from "@/components/ui/SmartImage";
import Button from "@/components/ui/Button";
import CtaBand from "@/components/sections/CtaBand";

export async function generateMetadata() {
  return buildMetadata("patientGuide", {}, await getSeoConfig());
}

function Checklist({ items }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((it) => (
        <li key={it} className="flex gap-3 rounded-xl bg-white p-4 leading-relaxed ring-1 ring-line">
          <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-600" />
          {it}
        </li>
      ))}
    </ul>
  );
}

function Steps({ steps }) {
  return (
    <ol className="mt-6 space-y-0">
      {steps.map((s, i) => (
        <li key={s.title} className="relative flex gap-5 pb-8 last:pb-0">
          {i < steps.length - 1 ? (
            <span aria-hidden="true" className="absolute top-10 bottom-0 left-[1.1rem] w-px bg-line" />
          ) : null}
          <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 font-display text-sm font-semibold text-white">
            {i + 1}
          </span>
          <div className="pt-1">
            <p className="font-display text-lg font-semibold">{s.title}</p>
            <p className="mt-1 leading-relaxed text-ink-soft">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function SideEffectTable({ table }) {
  const [c1, c2, c3] = table.columns;
  return (
    <>
      {/* Table on ≥ md, stacked cards on mobile (tables don't squeeze well) */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl ring-1 ring-line md:block">
        <table className="w-full border-collapse bg-white text-left">
          <thead className="bg-mist text-sm text-ink">
            <tr>
              {table.columns.map((c) => (
                <th key={c} scope="col" className="px-5 py-3.5 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {table.rows.map(([effect, helps, call]) => (
              <tr key={effect} className="align-top">
                <th scope="row" className="px-5 py-4 font-display font-semibold">
                  {effect}
                </th>
                <td className="px-5 py-4 leading-relaxed text-ink-soft">{helps}</td>
                <td className="px-5 py-4 leading-relaxed text-alert-700">{call}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-6 space-y-3 md:hidden">
        {table.rows.map(([effect, helps, call]) => (
          <li key={effect} className="rounded-2xl bg-white p-5 ring-1 ring-line">
            <p className="font-display text-lg font-semibold">{effect}</p>
            <p className="mt-3 text-sm font-semibold text-ink-muted">{c2}</p>
            <p className="leading-relaxed text-ink-soft">{helps}</p>
            <p className="mt-3 text-sm font-semibold text-ink-muted">{c3}</p>
            <p className="leading-relaxed text-alert-700">{call}</p>
            <span className="sr-only">{c1}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function Tips({ tips, image }) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-5">
      <dl className="grid gap-3 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-1">
        {tips.map((t) => (
          <div key={t.title} className="rounded-xl bg-white p-4 ring-1 ring-line">
            <dt className="font-display font-semibold">{t.title}</dt>
            <dd className="mt-1 leading-relaxed text-ink-soft">{t.text}</dd>
          </div>
        ))}
      </dl>
      {image ? (
        <div className="relative hidden overflow-hidden rounded-2xl bg-mist lg:col-span-2 lg:block">
          <SmartImage src={image.src} alt={image.alt} fill sizes="25vw" className="object-cover" />
        </div>
      ) : null}
    </div>
  );
}

export default async function PatientGuidePage() {
  const siteConfig = await getSiteConfig();
  const { header, tocLabel, disclaimer, urgent, sections, cta } = await withSlots(patientGuideData);
  const toc = [urgent, ...sections];

  return (
    <>
      <PageHeader
        crumbs={[siteConfig.nav[0], { label: header.eyebrow, href: "/patient-guide" }]}
        eyebrow={header.eyebrow}
        title={header.title}
        highlight={header.highlight}
        description={header.description}
        image={header.image}
      />

      <div className="container-site grid gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:gap-16">
        <aside className="lg:col-span-3 print:hidden">
          <nav aria-label={tocLabel} className="lg:sticky lg:top-28">
            <p className="text-sm font-semibold tracking-wide text-ink-muted uppercase">{tocLabel}</p>
            <ol className="mt-4 space-y-1 border-l border-line">
              {toc.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-ink-soft transition-colors hover:border-brand-500 hover:text-ink"
                  >
                    <span className="mr-2 font-serif text-brand-600 italic">{i + 1}.</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="space-y-20 lg:col-span-9">
          {/* Urgent warning signs — first, because it's the most important */}
          <section
            id={urgent.id}
            aria-labelledby={`${urgent.id}-title`}
            className="scroll-mt-28 rounded-[1.5rem] bg-alert-50 p-6 ring-1 ring-alert-600/20 sm:p-8"
          >
            <h2 id={`${urgent.id}-title`} className="flex items-center gap-3 text-2xl font-semibold text-alert-700">
              <TriangleAlert aria-hidden="true" className="size-6 shrink-0" />
              {urgent.title}
            </h2>
            <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {urgent.signs.map((s) => (
                <li key={s} className="flex gap-3 leading-relaxed text-ink">
                  <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-alert-600" />
                  {s}
                </li>
              ))}
            </ul>
            <Button href={siteConfig.contact.phoneHref} variant="dark" icon={Phone} className="mt-8">
              {urgent.action} {siteConfig.contact.phone}
            </Button>
          </section>

          {sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-28">
              <h2 id={`${s.id}-title`} className="text-3xl font-semibold">
                {s.title}
              </h2>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">{s.intro}</p>
              {s.checklist ? <Checklist items={s.checklist} /> : null}
              {s.steps ? <Steps steps={s.steps} /> : null}
              {s.table ? <SideEffectTable table={s.table} /> : null}
              {s.tips ? <Tips tips={s.tips} image={s.image} /> : null}
            </section>
          ))}

          <p className="border-t border-line pt-6 text-sm leading-relaxed text-ink-muted">{disclaimer}</p>
        </div>
      </div>

      <CtaBand title={cta.title} description={cta.description} primary={cta.primary} />
    </>
  );
}
