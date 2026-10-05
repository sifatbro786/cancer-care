import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * PRIVATE file storage — prescriptions and other patient documents.
 * Lives OUTSIDE /public, so Next never serves it statically; files are streamed
 * only through an authenticated admin route (B3/B4).
 *
 * PRIVATE_STORAGE_DIR (absolute path recommended on the VPS, e.g. /var/lib/cancer-care)
 * defaults to ./storage. Back it up with the database — orders reference these paths.
 */
// turbopackIgnore: this is a runtime data dir, not a build input — stops the
// file tracer from pulling the whole project into the server bundle trace.
const ROOT = path.resolve(
  /* turbopackIgnore: true */ process.env.PRIVATE_STORAGE_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), "storage")
);

function resolveInside(relPath) {
  const abs = path.resolve(ROOT, relPath);
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) throw new Error("[storage] path escapes storage root");
  return abs;
}

/**
 * Save a verified buffer. File name is a random UUID — never derived from user input.
 * Returns { path (relative, posix), size, sha256 }.
 */
export async function savePrivateFile({ buffer, ext, folder }) {
  if (!/^[a-z0-9]{2,5}$/.test(ext)) throw new Error("[storage] bad extension");
  if (!/^[a-z0-9-]+$/.test(folder)) throw new Error("[storage] bad folder");

  const now = new Date();
  const rel = path.posix.join(
    folder,
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    `${randomUUID()}.${ext}`
  );
  const abs = resolveInside(rel);

  await mkdir(path.dirname(abs), { recursive: true, mode: 0o700 });
  await writeFile(abs, buffer, { flag: "wx", mode: 0o600 }); // wx: never overwrite

  return { path: rel, size: buffer.length, sha256: createHash("sha256").update(buffer).digest("hex") };
}

/** Best-effort delete (rollback / admin delete). Never throws. */
export async function removePrivateFile(relPath) {
  try {
    await unlink(resolveInside(relPath));
  } catch (err) {
    if (err?.code !== "ENOENT") console.error("[storage] remove failed:", err?.message);
  }
}
