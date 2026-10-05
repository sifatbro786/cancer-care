import "server-only";

/**
 * Fixed-window in-memory rate limiter, keyed by `${bucket}:${ip}`.
 *
 * Scope: per server instance. On the VPS (single PM2 process) this is exact.
 * On Vercel each lambda instance keeps its own map — still a useful brake
 * against form spam, but swap `store` for Redis/Upstash if you need a global limit.
 */
const store = globalThis.__ccRateLimit ?? (globalThis.__ccRateLimit = new Map());
const MAX_KEYS = 5000;

export function rateLimit(key, { limit = 5, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.reset <= now) {
    // Opportunistic cleanup so the map can't grow without bound
    if (store.size > MAX_KEYS) {
      for (const [k, v] of store) if (v.reset <= now) store.delete(k);
    }
    store.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  }
  return { ok: true, remaining: limit - entry.count, retryAfter: 0 };
}
