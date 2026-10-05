import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names and resolve Tailwind conflicts (last wins). */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const bdtFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
});

/** 6500 → "৳6,500". Money is stored as integer BDT everywhere. */
export function formatBDT(amount) {
  if (!Number.isFinite(amount)) return "—";
  return bdtFormatter.format(amount);
}

/** Discount percentage between MRP and selling price (0 if invalid). */
export function discountPercent(price, mrp) {
  if (!mrp || !price || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Dhaka",
});

/** "2026-09-18" → "18 Sept 2026" (fixed TZ avoids server/client hydration drift). */
export function formatDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : dateFormatter.format(d);
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
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Compact number for stats: 8000 → "8k" (keeps short labels readable). */
export function compactNumber(n) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(n);
}
