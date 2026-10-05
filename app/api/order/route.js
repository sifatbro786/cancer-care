import { z } from "zod";
import { productsData } from "@/data/productsData";
import { shopData } from "@/data/shopData";
import { orderSchema, PRESCRIPTION_MAX_BYTES, requiresPrescription } from "@/lib/validation/order";
import { rateLimit } from "@/lib/server/rateLimit";
import { getClientIp, isSameOrigin, makeReference, reply } from "@/lib/server/request";
import { readPrescription } from "@/lib/server/files";
import { sendMail } from "@/lib/server/mailer";
import { orderEmail } from "@/lib/server/emailTemplates";

// File + text fields; anything bigger is rejected before parsing
const MAX_BODY = PRESCRIPTION_MAX_BYTES + 64 * 1024;

/**
 * POST /api/order — multipart/form-data with optional `prescription` file.
 * The file is verified by magic bytes and emailed as an attachment.
 * Backend phase: write the buffer to /uploads (VPS) and store the path + order in the DB.
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
  const rx = requiresPrescription(o.product);
  const upload = form.get("prescription");
  const hasFile = upload && typeof upload !== "string" && upload.size > 0;

  let attachment;
  if (rx || hasFile) {
    const file = await readPrescription(upload);
    if (!file.ok) {
      if (file.tooLarge) return reply.tooLarge(file.error);
      return reply.invalid({ prescription: [file.error] });
    }
    const reference = makeReference("RX");
    attachment = { filename: `prescription-${reference}.${file.ext}`, content: file.buffer, contentType: file.mime };
    o.reference = reference;
  }

  const reference = o.reference ?? makeReference("RX");
  const product = productsData.find((p) => p.slug === o.product);
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
  if (!sent) return reply.failed();

  return reply.ok({ reference });
}
