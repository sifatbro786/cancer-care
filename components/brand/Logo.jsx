import Link from "next/link";
import { siteConfig } from "@/data/siteConfig";
import { cn } from "@/lib/utils";

/** Ribbon mark — an awareness ribbon drawn as a single continuous loop. */
export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={cn("size-10", className)}>
      <rect width="40" height="40" rx="11" className="fill-brand-600" />
      <path
        d="M20 8.5c-3.3 0-5.8 2.6-5.8 6 0 2.7 1.5 5.4 3.6 8.4l-6.9 11.2 3.3 1.7 5.8-9 5.8 9 3.3-1.7-6.9-11.2c2.1-3 3.6-5.7 3.6-8.4 0-3.4-2.5-6-5.8-6Zm0 3.4c1.5 0 2.5 1.1 2.5 2.7 0 1.6-1 3.6-2.5 5.8-1.5-2.2-2.5-4.2-2.5-5.8 0-1.6 1-2.7 2.5-2.7Z"
        className="fill-white"
      />
    </svg>
  );
}

export default function Logo({ invert = false, className }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — home`}
      className={cn("inline-flex items-center gap-3 rounded-lg", className)}
    >
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-lg font-bold tracking-tight", invert ? "text-white" : "text-ink")}>
          {siteConfig.shortName}
        </span>
        <span
          className={cn(
            "mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]",
            invert ? "text-brand-200" : "text-brand-700"
          )}
        >
          & Medical Services
        </span>
      </span>
    </Link>
  );
}
