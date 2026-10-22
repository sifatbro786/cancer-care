import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/data/siteConfig";
import { cn } from "@/lib/utils";

const { logo } = siteConfig;

/** Ribbon + stethoscope-heart mark (icon-only) — admin sidebar, compact spots. */
export function LogoMark({ className }) {
  return (
    <Image
      src={logo.mark}
      alt=""
      aria-hidden="true"
      width={80}
      height={80}
      quality={90}
      className={cn("size-10 object-contain", className)}
    />
  );
}

/**
 * Full Adelin lockup. The artwork is full-colour on transparent, so on dark
 * surfaces (`invert`) it sits on a white chip instead of being recoloured.
 */
export default function Logo({ invert = false, className }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — home`}
      className={cn(
        "inline-flex shrink-0 items-center rounded-lg",
        invert && "rounded-2xl bg-white px-4 py-2.5 shadow-sm",
        className
      )}
    >
      {/* Intrinsic width/height + CSS height & w-auto: both axes resize together (no aspect warning).
          Header logo is often the LCP on mobile → eager; the footer copy stays lazy. */}
      <Image
        src={logo.src}
        alt={siteConfig.name}
        width={logo.width}
        height={logo.height}
        sizes="160px"
        quality={90}
        loading={invert ? "lazy" : "eager"}
        className="h-12 w-auto sm:h-14"
      />
    </Link>
  );
}
