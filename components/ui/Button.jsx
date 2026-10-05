import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const base =
  "group/btn inline-flex items-center justify-center gap-2 font-display font-semibold whitespace-nowrap " +
  "rounded-xl transition-[background-color,color,box-shadow,transform] duration-200 " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-60 " +
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-500";

const variants = {
  primary: "bg-brand-600 text-white shadow-[0_6px_18px_-8px_rgb(14_110_102/0.6)] hover:bg-brand-700",
  secondary: "bg-white text-ink ring-1 ring-line hover:ring-brand-300 hover:text-brand-700",
  dark: "bg-brand-950 text-white hover:bg-brand-900",
  light: "bg-white text-brand-800 hover:bg-brand-50",
  ghost: "text-brand-700 hover:bg-brand-50",
  outlineLight: "text-white ring-1 ring-white/50 hover:bg-white/10",
};

const sizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-[0.95rem]",
  lg: "h-14 px-7 text-base",
};

/** Square arrow chip attached to the label — echoes the reference design's CTA */
const arrowChip = {
  primary: "bg-white/15",
  secondary: "bg-brand-50 text-brand-700",
  dark: "bg-white/15",
  light: "bg-brand-600 text-white",
  ghost: "bg-brand-100",
  outlineLight: "bg-white/15",
};

/**
 * Polymorphic button: renders <Link> when `href` is set, otherwise <button>.
 * External links (http, tel:, mailto:, wa.me) render a plain <a>.
 */
export default function Button({
  href,
  variant = "primary",
  size = "md",
  withArrow = false,
  icon: Icon,
  className,
  children,
  external,
  ...props
}) {
  const classes = cn(base, variants[variant], sizes[size], withArrow && "pr-1.5", className);

  const content = (
    <>
      {Icon ? <Icon aria-hidden="true" className="size-[1.1em] shrink-0" /> : null}
      <span>{children}</span>
      {withArrow ? (
        <span
          aria-hidden="true"
          className={cn(
            "ml-1 grid size-9 place-items-center rounded-lg transition-transform duration-200 group-hover/btn:translate-x-0.5",
            size === "sm" && "size-7",
            size === "lg" && "size-11",
            arrowChip[variant]
          )}
        >
          <ArrowRight className="size-4" />
        </span>
      ) : null}
    </>
  );

  if (href) {
    const isExternal = external ?? /^(https?:|tel:|mailto:)/.test(href);
    if (isExternal) {
      const newTab = href.startsWith("http");
      return (
        <a
          href={href}
          className={classes}
          {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          {...props}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  );
}
