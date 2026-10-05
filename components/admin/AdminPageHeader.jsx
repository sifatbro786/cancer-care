import AccentText from "@/components/ui/AccentText";
import { Eyebrow } from "@/components/ui/SectionHeading";

/** Page title block for admin screens — same editorial voice as the public site, smaller scale. */
export default function AdminPageHeader({ eyebrow, title, highlight, description }) {
  return (
    <header className="mb-10 flex flex-col gap-3 border-b border-line pb-8">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        <AccentText text={title} accent={highlight} className="text-brand-700" />
      </h1>
      {description ? <p className="max-w-2xl text-ink-soft">{description}</p> : null}
    </header>
  );
}
