import { cn } from "@/lib/utils";

/**
 * Two-tone headline: `accent` (a substring of `text`) is set in the same face
 * and weight, one tone quieter. Hierarchy comes from tone, not from a second
 * typeface — reads as edited typography rather than a decorative flourish.
 * Pass `invert` on dark backgrounds.
 */
export default function AccentText({ text, accent, invert = false, className }) {
  if (!accent || !text.includes(accent)) return text;
  const [before, after] = text.split(accent);
  return (
    <>
      {before}
      <span className={cn(invert ? "text-white/60" : "text-ink-quiet", className)}>{accent}</span>
      {after}
    </>
  );
}
