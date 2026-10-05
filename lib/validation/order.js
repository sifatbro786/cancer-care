import { z } from "zod";
import { formMessages as M } from "@/data/formMessages";
import { productsData } from "@/data/productsData";
import { bdPhoneField, honeypotField, messageField, nameField } from "@/lib/validation/common";

export const PRESCRIPTION_MAX_BYTES = 4 * 1024 * 1024; // stays under Vercel's 4.5 MB body limit
export const PRESCRIPTION_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const PRESCRIPTION_ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf";

const productSlugs = productsData.map((p) => p.slug);

/**
 * Order / prescription request (text fields only).
 * The file is validated separately — client: type/size; server: type/size + magic bytes.
 * `product` is optional: empty = "medicines as per prescription".
 */
export const orderSchema = z.object({
  product: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(z.enum(productSlugs).optional()),
  quantity: z.coerce.number({ error: M.quantity }).int(M.quantity).min(1, M.quantity).max(20, M.quantity),
  name: nameField,
  phone: bdPhoneField,
  address: z.string({ error: M.address }).trim().min(8, M.address).max(240, M.address),
  note: messageField(0).optional(),
  company: honeypotField,
});

/** Does this request need a prescription file? (Rx product, or no product = general Rx upload) */
export function requiresPrescription(productSlug) {
  if (!productSlug) return true;
  return productsData.find((p) => p.slug === productSlug)?.requiresPrescription ?? true;
}

/** Client-side file check (server re-checks with magic bytes). */
export function checkFile(file) {
  if (!file) return M.file.required;
  if (!PRESCRIPTION_TYPES.includes(file.type)) return M.file.type;
  if (file.size > PRESCRIPTION_MAX_BYTES) return M.file.size;
  return null;
}
