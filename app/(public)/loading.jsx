import { statusData } from "@/data/statusData";

/**
 * Shown while a public route's server data loads (instant on static pages,
 * visible once pages read from the database). Mirrors the PageHeader shape
 * so the layout doesn't jump when content arrives.
 */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="container-site animate-pulse py-14 sm:py-20">
      <span className="sr-only">{statusData.loading}</span>
      <div className="h-4 w-40 rounded bg-line" />
      <div className="mt-8 h-12 w-3/4 max-w-2xl rounded-lg bg-line" />
      <div className="mt-4 h-12 w-1/2 max-w-xl rounded-lg bg-line" />
      <div className="mt-8 h-5 w-full max-w-xl rounded bg-line/70" />
      <div className="mt-3 h-5 w-5/6 max-w-lg rounded bg-line/70" />
      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-64 rounded-[1.25rem] bg-white ring-1 ring-line" />
        ))}
      </div>
    </div>
  );
}
