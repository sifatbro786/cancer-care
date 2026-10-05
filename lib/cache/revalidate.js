import "server-only";
import { revalidateTag } from "next/cache";
import { TAGS } from "@/lib/cache/tags";

const KNOWN = new Set(Object.values(TAGS));

/**
 * Invalidate one or more content tags after an admin write.
 * "max" = stale-while-revalidate: visitors never wait on the DB; the next
 * visit triggers regeneration (Next 16 two-argument form).
 */
export function revalidateContent(...tags) {
  for (const tag of tags) {
    if (!KNOWN.has(tag)) throw new Error(`[cache] unknown tag "${tag}"`);
    revalidateTag(tag, "max");
  }
}
