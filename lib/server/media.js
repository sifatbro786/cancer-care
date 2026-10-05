import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * PUBLIC media pipeline (admin uploads → site images).
 * ─────────────────────────────────────────────────────────────────
 * - Accepts JPEG / PNG / WebP / AVIF, verified by magic bytes (never the client MIME).
 *   SVG and GIF are refused: SVG can carry script, GIF isn't worth the risk/size.
 * - Re-encodes EVERYTHING to WebP with sharp: auto-rotates from EXIF, strips all metadata
 *   (GPS / camera serials in clinic photos), caps the long edge, bounds decode cost.
 *   Re-encoding also defeats polyglot files — what we serve is always a clean image.
 * - Stored under MEDIA_DIR (default ./storage/media), served by app/media/[...path]/route.js.
 *   Not /public: `next start` only serves files that existed in /public at build time.
 * ─────────────────────────────────────────────────────────────────
 */

export const MEDIA_MAX_BYTES = 10 * 1024 * 1024; // input cap (phone photos)
const MAX_EDGE = 2400; // px — enough for a full-bleed hero on retina
const MAX_INPUT_PIXELS = 50_000_000; // decompression-bomb guard (~7000×7000)

// turbopackIgnore: runtime data dir, not a build input (keeps file tracing small)
export const MEDIA_ROOT = path.resolve(
  /* turbopackIgnore: true */ process.env.MEDIA_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), "storage", "media")
);

const SIGNATURES = [
  { mime: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  {
    mime: "image/webp",
    test: (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP",
  },
  {
    mime: "image/avif",
    test: (b) => b.toString("ascii", 4, 8) === "ftyp" && /^avi[fs]$/.test(b.toString("ascii", 8, 12)),
  },
];

export const MEDIA_ACCEPT = ".jpg,.jpeg,.png,.webp,.avif";

/** Relative media path → absolute, refusing anything that escapes MEDIA_ROOT. */
export function resolveMediaPath(relPath) {
  const abs = path.resolve(MEDIA_ROOT, relPath);
  if (!abs.startsWith(MEDIA_ROOT + path.sep)) throw new Error("[media] path escapes media root");
  return abs;
}

/**
 * Validate + transcode. Returns { ok, buffer, width, height, size } | { ok:false, code }.
 * codes: "empty" | "tooLarge" | "type" | "corrupt"
 */
export async function processImage(file) {
  if (!file || typeof file === "string" || file.size === 0) return { ok: false, code: "empty" };
  if (file.size > MEDIA_MAX_BYTES) return { ok: false, code: "tooLarge" };

  const input = Buffer.from(await file.arrayBuffer());
  if (!SIGNATURES.some((s) => s.test(input))) return { ok: false, code: "type" };

  try {
    const { data, info } = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" })
      .rotate() // honour EXIF orientation before metadata is dropped
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    return { ok: true, buffer: data, width: info.width, height: info.height, size: info.size };
  } catch (err) {
    console.warn("[media] sharp rejected upload:", err?.message);
    return { ok: false, code: "corrupt" };
  }
}

/** Write a processed buffer → { path, url }. UUID name; `wx` = never overwrite. */
export async function saveMediaFile(buffer) {
  const now = new Date();
  const rel = path.posix.join(
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    `${randomUUID()}.webp`
  );
  const abs = resolveMediaPath(rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, buffer, { flag: "wx", mode: 0o644 });
  return { path: rel, url: `/media/${rel}` };
}

export async function removeMediaFile(relPath) {
  try {
    await unlink(resolveMediaPath(relPath));
  } catch (err) {
    if (err?.code !== "ENOENT") console.error("[media] remove failed:", err?.message);
  }
}

export async function readMediaFile(relPath) {
  return readFile(resolveMediaPath(relPath));
}
