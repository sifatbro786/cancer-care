/**
 * Lets plain Node scripts (seed, create-admin) import app modules:
 *   - resolves the `@/` alias → project root (same as jsconfig.json)
 *   - stubs `server-only` (it throws outside the Next.js server bundle)
 * Usage: node --import ./scripts/register-alias.mjs scripts/seed.mjs
 */
import { registerHooks } from "node:module";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = process.cwd();
const EXT = ["", ".js", ".jsx", ".mjs", "/index.js"];
const isFile = (p) => existsSync(p) && statSync(p).isFile();

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") {
      return { url: "data:text/javascript,export{}", shortCircuit: true };
    }
    if (specifier.startsWith("@/")) {
      const base = path.join(root, specifier.slice(2));
      const hit = EXT.map((e) => base + e).find(isFile);
      if (hit) return nextResolve(pathToFileURL(hit).href, context);
    }
    // Extension-less relative imports inside OUR modules (e.g. "./_shared"); node_modules untouched
    const parent = context.parentURL?.startsWith("file:") ? fileURLToPath(context.parentURL) : null;
    if (
      parent &&
      specifier.startsWith(".") &&
      !path.extname(specifier) &&
      parent.startsWith(root) &&
      !parent.includes(`${path.sep}node_modules${path.sep}`)
    ) {
      const base = path.resolve(path.dirname(parent), specifier);
      const hit = EXT.map((e) => base + e).find(isFile);
      if (hit) return nextResolve(pathToFileURL(hit).href, context);
    }
    return nextResolve(specifier, context);
  },
});
