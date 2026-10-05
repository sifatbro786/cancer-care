import { z } from "zod";
import { formMessages as M } from "@/data/formMessages";
import { shopData } from "@/data/shopData";
import { orderSchema, PRESCRIPTION_MAX_BYTES, requiresPrescription } from "@/lib/validation/order";
import { rateLimit } from "@/lib/server/rateLimit";
import { getClientIp, isSameOrigin, makeReference, reply, requestMeta } from "@/lib/server/request";
import { readPrescription } from "@/lib/server/files";
import { removePrivateFile, savePrivateFile } from "@/lib/server/storage";
import { sendMail } from "@/lib/server/mailer";
import { orderEmail } from "@/lib/server/emailTemplates";
import { getProductBySlug } from "@/services/content";
import { markNotified, saveOrder } from "@/services/submissions";
import { isDbConfigured } from "@/lib/db/connect";

// File + text fields; anything bigger is rejected before parsing
const MAX_BODY = PRESCRIPTION_MAX_BYTES + 64 * 1024;

/**
 * POST /api/order — multipart/form-data with optional `prescription` file.
 * Pipeline: origin → rate limit → size cap → honeypot → zod → product lookup (DB price)
 *           → magic-byte file check → private storage → save order → email (+ attachment).
 * If the order save fails after the file was written, the file is removed (no orphans).
 */
export async function POST(request) {
  if (!isSameOrigin(request)) return reply.forbidden();

  const limit = rateLimit(`order:${getClientIp(request)}`, { limit: 6, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) return reply.limited(limit.retryAfter);

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) {
    return reply.tooLarge(shopData.modal.fields.prescription.hint);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return reply.invalid({});
  }

  const fields = Object.fromEntries(
    ["product", "quantity", "name", "phone", "address", "note", "company"].map((k) => [k, form.get(k) ?? undefined])
  );
  if (fields.company) return reply.ok({ reference: makeReference("RX") });

  const parsed = orderSchema.safeParse(fields);
  if (!parsed.success) return reply.invalid(z.flattenError(parsed.error).fieldErrors);

  const o = parsed.data;

  // Product must exist, be active and in stock — price & Rx flag come from the catalogue, never the client
  const product = o.product ? await getProductBySlug(o.product) : null;
  if (o.product && (!product || !product.inStock)) return reply.invalid({ product: [M.product] });

  const rx = requiresPrescription(product);
  const upload = form.get("prescription");
  const hasFile = upload && typeof upload !== "string" && upload.size > 0;

  let file = null;
  if (rx || hasFile) {
    file = await readPrescription(upload);
    if (!file.ok) {
      if (file.tooLarge) return reply.tooLarge(file.error);
      return reply.invalid({ prescription: [file.error] });
    }
  }

  // Persist: file first (private storage), then the order that points at it
  let stored = null;
  let record = null;
  if (isDbConfigured()) {
    try {
      if (file) stored = await savePrivateFile({ buffer: file.buffer, ext: file.ext, folder: "prescriptions" });
      record = await saveOrder(o, {
        product,
        rx,
        file: stored ? { ...stored, mime: file.mime } : null,
        meta: requestMeta(request),
      });
    } catch (err) {
      // DB down → no orphan file; degrade to email-only (prescription goes as attachment)
      console.error("[order] save failed, falling back to email-only:", err?.message);
      if (stored) await removePrivateFile(stored.path);
    }
  }

  const reference = record?.reference ?? makeReference("RX");
  const attachment = file
    ? { filename: `prescription-${reference}.${file.ext}`, content: file.buffer, contentType: file.mime }
    : null;

  const sent = await sendMail({
    ...orderEmail({
      ...o,
      reference,
      rx,
      productLabel: product?.name ?? shopData.modal.generalProduct,
      fileName: attachment?.filename,
    }),
    attachments: attachment ? [attachment] : undefined,
  });
  await markNotified(record, sent);
  if (!sent && !record) return reply.failed();

  return reply.ok({ reference });
}
