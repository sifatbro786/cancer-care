/**
 * Smoke test (B7) — black-box checks against a RUNNING server. No DB access, no login.
 *   npm run dev            (or npm run build && npm start)
 *   npm run smoke          → http://localhost:3000
 *   BASE_URL=https://example.com npm run smoke
 * Exit code 1 if any check fails. Safe to run against production: it only reads,
 * and the form checks are designed to be rejected before anything is saved.
 */
const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push([true, name]);
  } catch (err) {
    results.push([false, `${name} — ${err.message}`]);
  }
}
const expect = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const get = (path, init = {}) => fetch(`${BASE}${path}`, { redirect: "manual", ...init });

const PUBLIC = ["/", "/about", "/services", "/appointment", "/shop", "/blog", "/patient-guide", "/contact", "/sitemap.xml", "/robots.txt", "/manifest.webmanifest"];

for (const path of PUBLIC) {
  await check(`GET ${path} → 200`, async () => {
    const r = await get(path);
    expect(r.status === 200, `status ${r.status}`);
  });
}

await check("security headers on public pages", async () => {
  const r = await get("/");
  expect(r.headers.get("x-content-type-options") === "nosniff", "nosniff missing");
  expect(r.headers.get("x-frame-options"), "x-frame-options missing");
  expect(!r.headers.get("x-powered-by"), "x-powered-by exposed");
});

await check("home has a <title> and canonical", async () => {
  const html = await (await get("/")).text();
  expect(/<title>[^<]{10,}<\/title>/.test(html), "no title");
  expect(/rel="canonical"/.test(html), "no canonical");
});

for (const path of ["/shop/this-product-does-not-exist", "/blog/this-post-does-not-exist", "/no-such-page"]) {
  await check(`GET ${path} → 404`, async () => {
    const r = await get(path);
    expect(r.status === 404, `status ${r.status}`);
  });
}

await check("robots.txt blocks /admin and /api", async () => {
  const t = await (await get("/robots.txt")).text();
  expect(/Disallow:\s*\/admin/i.test(t), "no /admin rule");
  expect(/Disallow:\s*\/api/i.test(t), "no /api rule");
});

await check("/admin without a session → redirect to login", async () => {
  const r = await get("/admin/content/services");
  expect([302, 303, 307, 308].includes(r.status), `status ${r.status}`);
  expect((r.headers.get("location") || "").includes("/admin/login"), "not sent to login");
});

await check("admin login page is noindex + no-store + not frameable", async () => {
  const r = await get("/admin/login");
  expect(r.status === 200, `status ${r.status}`);
  expect((r.headers.get("x-robots-tag") || "").includes("noindex"), "x-robots-tag missing");
  expect((r.headers.get("cache-control") || "").includes("no-store"), "cache-control not no-store");
  expect((r.headers.get("x-frame-options") || "").toUpperCase() === "DENY", "x-frame-options not DENY");
});

for (const path of ["/api/admin/export/orders", "/api/admin/export/appointments", "/api/admin/prescriptions/000000000000000000000000"]) {
  await check(`GET ${path} without a session → 401`, async () => {
    const r = await get(path);
    expect(r.status === 401, `status ${r.status}`);
  });
}

await check("forged admin cookie is rejected", async () => {
  const forged = "eyJhbGciOiJub25lIn0.eyJ1c2VySWQiOiJ4Iiwicm9sZSI6InN1cGVyX2FkbWluIn0.";
  const r = await get("/api/admin/export/orders", { headers: { cookie: `cc_admin=${forged}; __Host-cc_admin=${forged}` } });
  expect(r.status === 401, `status ${r.status}`);
});

await check("POST /api/admin/media without a session → 401", async () => {
  const r = await get("/api/admin/media", { method: "POST" });
  expect(r.status === 401, `status ${r.status}`);
});

await check("contact form: cross-origin POST → 403", async () => {
  const r = await get("/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://evil.example" },
    body: JSON.stringify({ name: "Smoke Test", phone: "01712345678", message: "hello there" }),
  });
  expect(r.status === 403, `status ${r.status}`);
});

await check("contact form: operator injection → 422 (not saved)", async () => {
  const r = await get("/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE },
    body: JSON.stringify({ name: { $gt: "" }, phone: { $ne: null }, message: "x" }),
  });
  expect(r.status === 422, `status ${r.status}`);
});

await check("appointment: invalid payload → 422 (not saved)", async () => {
  const r = await get("/api/appointment", {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE },
    body: JSON.stringify({ type: "chamber", date: "not-a-date" }),
  });
  expect(r.status === 422, `status ${r.status}`);
});

for (const path of ["/media/..%2F..%2F.env", "/media/2026/13/x.webp", "/media/2026/10/not-a-uuid.webp"]) {
  await check(`GET ${path} → 404 (no traversal)`, async () => {
    const r = await get(path);
    expect(r.status === 404, `status ${r.status}`);
  });
}

const failed = results.filter(([ok]) => !ok);
for (const [ok, name] of results) console.log(`${ok ? "✓" : "✗"} ${name}`);
console.log(`\n${results.length - failed.length}/${results.length} passed against ${BASE}`);
process.exitCode = failed.length ? 1 : 0;
