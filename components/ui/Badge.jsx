import { cn } from "@/lib/utils";

const tones = {
  brand: "bg-brand-50 text-brand-800 ring-brand-200/70",
  coral: "bg-coral-50 text-coral-700 ring-coral-200/70",
  sage: "bg-sage-50 text-sage-700 ring-sage-100",
  neutral: "bg-paper-deep text-ink-soft ring-line",
  solid: "bg-brand-600 text-white ring-transparent",
  glass: "bg-white/85 text-ink ring-white/60 backdrop-blur",
};

export default function Badge({ tone = "brand", icon: Icon, className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ring-1 ring-inset",
        tones[tone],
        className
      )}
      {...props}
    >
      {Icon ? <Icon aria-hidden="true" className="size-3.5" /> : null}
      {children}
    </span>
  );
}
