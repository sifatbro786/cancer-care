import mongoose from "mongoose";

/**
 * MongoDB connection singleton.
 * ─────────────────────────────────────────────────────────────────
 * One pool per server process. The promise is cached on globalThis so
 * dev HMR and parallel Route Handler/RSC calls never open extra pools.
 * A failed connect clears the cache so the next request retries
 * instead of awaiting a rejected promise forever.
 *
 * Safe to import from plain Node scripts (seed) — no `server-only` here.
 * ─────────────────────────────────────────────────────────────────
 */

const cache = globalThis.__ccMongo ?? (globalThis.__ccMongo = { conn: null, promise: null });

/** DB mode is opt-in by env. Without MONGODB_URI the site runs on `data/*.js` (static demo). */
export const isDbConfigured = () => Boolean(process.env.MONGODB_URI);

// Global query hardening (set once, before any model is used):
//  - strictQuery: unknown fields in filters are dropped, not passed to Mongo
//  - sanitizeFilter: any user value shaped like { $ne: ... } is wrapped in $eq
//    → NoSQL operator injection is neutralised even if a handler forgets to cast.
//    Our own operator queries opt out explicitly with mongoose.trusted().
mongoose.set("strictQuery", true);
mongoose.set("sanitizeFilter", true);

export async function connectDB() {
  if (cache.conn && mongoose.connection.readyState === 1) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("[db] MONGODB_URI is not set.");

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB || undefined, // falls back to the db in the URI
        bufferCommands: false, // fail fast instead of queueing queries while disconnected
        maxPoolSize: Number(process.env.MONGODB_POOL_SIZE || 10),
        serverSelectionTimeoutMS: 8_000,
        socketTimeoutMS: 30_000,
        // Index builds on boot are a production foot-gun on large collections.
        // Prod indexes are created by `npm run seed` (Model.createIndexes()).
        autoIndex: process.env.NODE_ENV !== "production",
      })
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

/** For CLI scripts only — Next.js keeps the pool for the life of the process. */
export async function disconnectDB() {
  if (cache.promise) await mongoose.disconnect();
  cache.conn = null;
  cache.promise = null;
}
