import "server-only";
import { PRESCRIPTION_MAX_BYTES } from "@/lib/validation/order";
import { formMessages as M } from "@/data/formMessages";

/**
 * Verify an uploaded file by its *content*, not the client-supplied MIME type.
 * Returns { ok, buffer, mime, ext } or { ok:false, error }.
 */
const SIGNATURES = [
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", ext: "png", test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  {
    mime: "image/webp",
    ext: "webp",
    test: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && // RIFF
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50, // WEBP
  },
  { mime: "application/pdf", ext: "pdf", test: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 },
];

export async function readPrescription(file) {
  if (!file || typeof file === "string" || file.size === 0) return { ok: false, error: M.file.required };
  if (file.size > PRESCRIPTION_MAX_BYTES) return { ok: false, error: M.file.size, tooLarge: true };

  const buffer = Buffer.from(await file.arrayBuffer());
  const match = SIGNATURES.find((s) => s.test(buffer));
  if (!match) return { ok: false, error: M.file.type };

  return { ok: true, buffer, mime: match.mime, ext: match.ext };
}
