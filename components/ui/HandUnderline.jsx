import { cn } from "@/lib/utils";

/** Hand-drawn marker stroke — the "human touch" accent under highlighted words. */
export default function HandUnderline({ className }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 14"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute -bottom-1.5 left-0 h-[0.4em] w-full text-coral-400/80", className)}
    >
      <path
        d="M2 9.5c32-4.6 71-7.2 112-6.6 36 .5 70 2.7 104 6.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
