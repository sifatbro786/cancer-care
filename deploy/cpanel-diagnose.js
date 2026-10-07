/**
 * TEMPORARY cPanel network diagnostic — upload as server.js, open the site, then DELETE.
 * Zero dependencies. Checks from the hosting server:
 *   1. outbound public IP (for MongoDB Atlas → Network Access)
 *   2. MongoDB Atlas  : TCP 27017 + TLS handshake (TLS fail with TCP ok = IP not allowed in Atlas)
 *   3. Gmail SMTP     : TCP 465 + TLS
 * Prints no secrets.
 */
const http = require("node:http");
const https = require("node:https");
const net = require("node:net");
const tls = require("node:tls");

const ATLAS = [
  "ac-ggo9dsb-shard-00-00.rt9yqps.mongodb.net",
  "ac-ggo9dsb-shard-00-01.rt9yqps.mongodb.net",
  "ac-ggo9dsb-shard-00-02.rt9yqps.mongodb.net",
];

const withTimeout = (p, ms) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`timeout ${ms}ms`)), ms))]);

function tcp(host, port) {
  return withTimeout(
    new Promise((resolve, reject) => {
      const s = net.connect({ host, port }, () => { s.destroy(); resolve("ok"); });
      s.on("error", reject);
    }),
    8000
  ).catch((e) => `FAIL: ${e.code || e.message}`);
}

function tlsCheck(host, port) {
  return withTimeout(
    new Promise((resolve, reject) => {
      const s = tls.connect({ host, port, servername: host }, () => { s.destroy(); resolve("ok"); });
      s.on("error", reject);
    }),
    8000
  ).catch((e) => `FAIL: ${e.code || e.message}`);
}

function publicIp() {
  return withTimeout(
    new Promise((resolve, reject) => {
      https.get("https://api.ipify.org", (r) => {
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => resolve(d.trim()));
      }).on("error", reject);
    }),
    8000
  ).catch((e) => `FAIL: ${e.code || e.message}`);
}

async function run() {
  const atlas = {};
  for (const h of ATLAS) atlas[h] = { tcp27017: await tcp(h, 27017), tls: await tlsCheck(h, 27017) };
  return {
    node: process.version,
    nodeEnv: process.env.NODE_ENV,
    outboundIp: await publicIp(),
    atlas,
    gmailSmtp465: { tcp: await tcp("smtp.gmail.com", 465), tls: await tlsCheck("smtp.gmail.com", 465) },
    checkedAt: new Date().toISOString(),
  };
}

http
  .createServer(async (req, res) => {
    const out = await run().catch((e) => ({ error: e.message }));
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    res.end(JSON.stringify(out, null, 2));
  })
  .listen(process.env.PORT || 3000);
