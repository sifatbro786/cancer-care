import { isDbConfigured } from "@/lib/db/connect";
import { SLUG_RE } from "@/lib/db/models/_shared";
import { dbSource } from "@/services/sources/db";
import { mockSource } from "@/services/sources/mock";

/**
 * Tiny in-process index of public slugs, used by proxy.js to answer unknown
 * /shop/:slug and /blog/:slug with a REAL 404 (the page itself can only send a
 * soft 404, because (public)/loading.jsx starts streaming before the lookup).
 *
 * - Refreshed every 60 s; a miss forces a refresh at most every 5 s
 *   → a product added in the admin is reachable within seconds, and slug-scanning
 *     bots cost at most one `distinct`-style query per 5 s.
 * - Fails OPEN: any error → "exists", and the page's own notFound() still applies.
 */
const TTL_MS = 60_000;
const MISS_REFRESH_MS = 5_000;
const state = globalThis.__ccSlugIndex ?? (globalThis.__ccSlugIndex = {});

const loaders = {
  shop: (src) => src.getAllProductSlugs(),
  blog: (src) => src.getAllBlogSlugs(),
};

async function refresh(kind) {
  const entry = state[kind];
  if (entry?.pending) return entry.pending; // de-duplicate concurrent refreshes
  const pending = loaders[kind](isDbConfigured() ? dbSource : mockSource)
    .then((list) => {
      state[kind] = { set: new Set(list.map((x) => x.slug)), at: Date.now() };
      return state[kind];
    })
    .finally(() => {
      if (state[kind]?.pending) delete state[kind].pending;
    });
  state[kind] = { ...entry, pending };
  return pending;
}

/** @returns {Promise<boolean>} */
export async function slugExists(kind, slug) {
  if (!loaders[kind]) return true;
  if (!SLUG_RE.test(slug) || slug.length > 120) return false;
  try {
    let entry = state[kind];
    const now = Date.now();
    if (!entry?.set || now - entry.at > TTL_MS) entry = await refresh(kind);
    if (entry.set.has(slug)) return true;
    if (now - entry.at > MISS_REFRESH_MS) entry = await refresh(kind);
    return entry.set.has(slug);
  } catch (err) {
    console.error("[slugIndex] lookup failed, failing open:", err?.message);
    return true;
  }
}
