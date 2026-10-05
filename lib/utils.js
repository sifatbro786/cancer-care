import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names and resolve Tailwind conflicts (last wins). */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/*
 * Money & dates are formatted WITHOUT Intl locale data on purpose.
 * Node (server) and the browser ship different ICU/CLDR versions, so
 * Intl output can differ ("৳" vs "BDT", "Sept" vs "Sep") — which causes
 * hydration mismatches in client components. These helpers are deterministic.
 */

/** 6500 → "৳6,500". Money is stored as integer BDT everywhere. */
export function formatBDT(amount) {
  if (!Number.isFinite(amount)) return "—";
  const sign = amount < 0 ? "-" : "";
  const digits = String(Math.round(Math.abs(amount))).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}৳${digits}`;
}

/** Discount percentage between MRP and selling price (0 if invalid). */
export function discountPercent(price, mrp) {
  if (!mrp || !price || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-18" → "18 Sep 2026". Date-only strings are read as calendar dates (no TZ shift). */
export function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  if (!m) return "";
  const [, y, mo, d] = m;
  return `${Number(d)} ${MONTHS[Number(mo) - 1]} ${y}`;
}

/** Estimate reading minutes from typed content blocks (~200 wpm, min 1). */
export function readingTime(blocks = []) {
  const words = blocks
    .flatMap((b) => (b.items ? b.items : [b.text ?? ""]))
    .join(" ")
    .trim()
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** URL-safe slug — used for future admin-created entities. */
export function slugify(input = "") {
  return input
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Thousands separator without Intl: 8000 → "8,000". */
export function formatNumber(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
