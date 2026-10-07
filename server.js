/**
 * Production entry for cPanel "Setup Node.js App" (CloudLinux · Passenger / LiteSpeed lsnode).
 * ─────────────────────────────────────────────────────────────────
 * - cPanel sets PORT (a number OR a unix-socket path) and proxies HTTPS → this process.
 *   It is passed to listen() untouched so both forms work.
 * - NODE_ENV defaults to production: only an explicit "development" runs dev mode,
 *   so a missing env var can never boot the dev server on the live host.
 * - Needs a prior `npm run build` (.next/BUILD_ID) — fails fast with a clear log line otherwise.
 * Local check:  npm run build && npm start  → http://localhost:3000
 * ─────────────────────────────────────────────────────────────────
 */
const fs = require("node:fs");
const path = require("node:path");
const { createServer } = require("node:http");

const dev = process.env.NODE_ENV === "development";
if (!dev) process.env.NODE_ENV = "production"; // before `next` loads — auth/db read it at import time

const next = require("next");

const port = process.env.PORT || 3000;
const dir = __dirname;

const log = (level, message, extra) =>
  console[level === "error" ? "error" : "log"](
    JSON.stringify({ level, at: new Date().toISOString(), message, ...extra })
  );

if (!dev && !fs.existsSync(path.join(dir, ".next", "BUILD_ID"))) {
  log("error", "[server] .next build not found — run `npm run build` before starting.", { dir });
  process.exit(1);
}

const app = next({ dev, dir });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      handle(req, res).catch((err) => {
        log("error", "[server] unhandled request error", { error: err?.message, path: req.url?.split("?")[0] });
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end("Internal Server Error");
        }
      });
    });

    // Keep-alive must outlive the proxy's idle timeout, or the proxy hits closed sockets (sporadic 502s)
    server.keepAliveTimeout = 65_000;
    server.headersTimeout = 66_000;

    server.listen(port, () => log("info", "[server] ready", { port: String(port), mode: dev ? "development" : "production" }));

    const shutdown = (signal) => {
      log("info", `[server] ${signal} received, closing`);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 10_000).unref(); // hard stop if sockets hang
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  })
  .catch((err) => {
    log("error", "[server] failed to start", { error: err?.message, stack: err?.stack?.split("\n").slice(0, 6).join("\n") });
    process.exit(1);
  });
