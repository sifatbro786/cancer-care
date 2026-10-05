import { HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";
import HandUnderline from "@/components/ui/HandUnderline";

/**
 * Section heading with eyebrow, optional highlighted phrase and lead text.
 * `highlight` must be a substring of `title`; it renders in brand colour with a
 * hand-drawn underline. Heading level is configurable to keep the outline valid.
 */
export default function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
  as: Heading = "h2",
  invert = false,
  id,
  className,
}) {
  let titleNode = title;
  if (highlight && title.includes(highlight)) {
    const [before, rest] = title.split(highlight);
    // Keep trailing punctuation glued to the highlight so it never wraps alone
    const [, punct = "", after = ""] = rest.match(/^([.,;:!?]*)([\s\S]*)$/) ?? [];
    titleNode = (
      <>
        {before}
        <span className={cn(highlight.length <= 16 && "whitespace-nowrap")}>
          <span className={cn("relative inline-block", invert ? "text-brand-200" : "text-brand-600")}>
            {highlight}
            <HandUnderline />
          </span>
          {punct}
        </span>
        {after}
      </>
    );
  }

  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" ? "mx-auto items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]",
            invert ? "text-brand-200" : "text-brand-700"
          )}
        >
          <HeartPulse aria-hidden="true" className="size-4" />
          {eyebrow}
        </p>
      ) : null}
      <Heading
        id={id}
        className={cn(
          "text-3xl leading-[1.15] font-semibold sm:text-4xl lg:text-[2.75rem]",
          invert && "text-white"
        )}
      >
        {titleNode}
      </Heading>
      {description ? (
        <p className={cn("text-lg leading-relaxed", invert ? "text-brand-100" : "text-ink-soft")}>{description}</p>
      ) : null}
    </div>
  );
}
