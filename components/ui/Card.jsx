import { cn } from "@/lib/utils";

const tones = {
  white: "bg-white ring-1 ring-line/80 shadow-soft",
  paper: "bg-paper-deep ring-1 ring-line",
  brand: "bg-brand-700 text-white ring-1 ring-brand-800",
  coral: "bg-coral-600 text-white",
  outline: "bg-transparent ring-1 ring-line",
};

/**
 * Surface primitive. `interactive` adds the lift-on-hover used by service / product cards.
 * Use `as="article"` / `as="li"` to keep semantics correct.
 */
export default function Card({ as: Tag = "div", tone = "white", interactive = false, className, children, ...props }) {
  return (
    <Tag
      className={cn(
        "relative rounded-[var(--radius-card)]",
        tones[tone],
        interactive &&
          "transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-lift focus-within:shadow-lift",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
