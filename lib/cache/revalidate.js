import "server-only";
import { revalidateTag, updateTag } from "next/cache";
import { TAGS } from "@/lib/cache/tags";

const KNOWN = new Set(Object.values(TAGS));

function check(tag) {
  if (!KNOWN.has(tag)) throw new Error(`[cache] unknown tag "${tag}"`);
}

/**
 * Route Handlers / background work: stale-while-revalidate ("max") — visitors never wait;
 * the next visit triggers regeneration (Next 16 two-argument form).
 */
export function revalidateContent(...tags) {
  for (const tag of tags) {
    check(tag);
    revalidateTag(tag, "max");
  }
}

/**
 * Server Actions only: expire immediately so the admin who just saved sees the change
 * on the very next request (read-your-own-writes).
 */
export function expireContent(...tags) {
  for (const tag of tags) {
    check(tag);
    updateTag(tag);
  }
}
