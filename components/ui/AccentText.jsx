import { cn } from "@/lib/utils";

/**
 * Renders `text` with `accent` (a substring) set in the editorial serif italic.
 * One restrained typographic moment per heading — no underlines, no stickers.
 */
export default function AccentText({ text, accent, className }) {
  if (!accent || !text.includes(accent)) return text;
  const [before, after] = text.split(accent);
  return (
    <>
      {before}
      <em className={cn("font-serif font-normal italic tracking-[-0.01em]", className)}>{accent}</em>
      {after}
    </>
  );
}
