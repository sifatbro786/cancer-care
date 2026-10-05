import { z } from "zod";
import { formMessages as M } from "@/data/formMessages";
import { bdPhoneField, honeypotField, messageField, nameField, optionalSlugField } from "@/lib/validation/common";

export const PRESCRIPTION_MAX_BYTES = 4 * 1024 * 1024; // stays under Vercel's 4.5 MB body limit
export const PRESCRIPTION_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const PRESCRIPTION_ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf";

/**
 * Order / prescription request (text fields only).
 * The file is validated separately — client: type/size; server: type/size + magic bytes.
 * `product` is optional: empty = "medicines as per prescription".
 */
export const orderSchema = z.object({
  product: optionalSlugField(M.product),
  quantity: z.coerce.number({ error: M.quantity }).int(M.quantity).min(1, M.quantity).max(20, M.quantity),
  name: nameField,
  phone: bdPhoneField,
  address: z.string({ error: M.address }).trim().min(8, M.address).max(240, M.address),
  note: messageField(0).optional(),
  company: honeypotField,
});

/**
 * Does this request need a prescription file?
 * `product` = the product object (client: from props; server: from the DB), or null
 * for a general "medicines as per prescription" upload → always required.
 */
export function requiresPrescription(product) {
  if (!product) return true;
  return product.requiresPrescription !== false;
}

/** Client-side file check (server re-checks with magic bytes). */
export function checkFile(file) {
  if (!file) return M.file.required;
  if (!PRESCRIPTION_TYPES.includes(file.type)) return M.file.type;
  if (file.size > PRESCRIPTION_MAX_BYTES) return M.file.size;
  return null;
}
