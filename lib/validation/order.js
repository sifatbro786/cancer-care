import { z } from "zod";
import { formMessages as M } from "@/data/formMessages";
import { bdPhoneField, honeypotField, messageField, nameField } from "@/lib/validation/common";

/** Display order on the order form. "offline" = we call first, pay cash on delivery / in person. */
export const PAYMENT_METHODS = ["bkash", "nagad", "offline"];
export const ONLINE_METHODS = ["bkash", "nagad"];
export const PAYMENT_STATUSES = ["unpaid", "pending", "paid", "failed", "review"];

/**
 * Medicine order (no prescription upload — owner decision 2026-10-12).
 * Price, stock and expiry are checked on the server against the live catalogue;
 * the client never sends money.
 */
export const orderSchema = z.object({
  product: z
    .string({ error: M.product })
    .trim()
    .max(120, M.product)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, M.product),
  quantity: z.coerce.number({ error: M.quantity }).int(M.quantity).min(1, M.quantity).max(20, M.quantity),
  name: nameField,
  phone: bdPhoneField,
  address: z.string({ error: M.address }).trim().min(8, M.address).max(240, M.address),
  note: messageField(0).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS, { error: M.paymentMethod }),
  company: honeypotField,
});

/** Retry an online payment for an existing order (from the /payment page). */
export const paymentStartSchema = z.object({
  reference: z.string().trim().regex(/^RX-\d{6}-[A-Z0-9]{4}$/, M.server.invalid),
  method: z.enum(ONLINE_METHODS, { error: M.paymentMethod }),
});
