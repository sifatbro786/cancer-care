import { cn } from "@/lib/utils";
import AccentText from "@/components/ui/AccentText";

/** Small editorial label: uppercase text, no decoration. */
export function Eyebrow({ children, invert = false, className }) {
  return (
    <p
      className={cn(
        "text-[0.78rem] font-semibold tracking-[0.16em] uppercase",
        invert ? "text-brand-200" : "text-brand-700",
        className
      )}
    >
      {children}
    </p>
  );
}

/**
 * Section heading. `highlight` (a substring of `title`) is set in the serif italic.
 * Heading level is configurable to keep the document outline valid.
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
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" ? "mx-auto items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow ? <Eyebrow invert={invert}>{eyebrow}</Eyebrow> : null}
      <Heading
        id={id}
        className={cn(
          "text-3xl leading-[1.12] font-semibold sm:text-4xl lg:text-[2.75rem]",
          invert && "text-white"
        )}
      >
        <AccentText text={title} accent={highlight} className={invert ? "text-brand-200" : "text-brand-700"} />
      </Heading>
      {description ? (
        <p className={cn("text-lg leading-relaxed", invert ? "text-brand-100" : "text-ink-soft")}>{description}</p>
      ) : null}
    </div>
  );
}
