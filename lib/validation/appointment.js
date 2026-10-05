import { z } from "zod";
import { formMessages as M } from "@/data/formMessages";
import { servicesData } from "@/data/servicesData";
import { isBookable } from "@/lib/schedule";
import {
  bdPhoneField,
  honeypotField,
  messageField,
  nameField,
  optionalEmailField,
} from "@/lib/validation/common";

const serviceSlugs = servicesData.map((s) => s.slug);

/**
 * Appointment request schema (shared client/server).
 * The cross-field check re-validates day + slot against the live schedule,
 * so a tampered request can't book a closed day or a past slot.
 */
export const appointmentSchema = z
  .object({
    type: z.enum(["chamber", "online"], { error: M.type }),
    service: z
      .string()
      .optional()
      .transform((v) => (v ? v : undefined))
      .pipe(z.enum(serviceSlugs).optional()),
    date: z.string({ error: M.date }).regex(/^\d{4}-\d{2}-\d{2}$/, M.date),
    slot: z.string({ error: M.slot }).regex(/^\d{2}:\d{2}$/, M.slot),
    name: nameField,
    phone: bdPhoneField,
    email: optionalEmailField,
    age: z
      .union([z.literal(""), z.coerce.number().int().min(1, M.age).max(120, M.age)])
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    visit: z.enum(["new", "follow-up"]).default("new"),
    message: messageField(0).optional(),
    consent: z.literal(true, { error: M.consent }),
    company: honeypotField,
  })
  .superRefine((v, ctx) => {
    if (!isBookable(v.type, v.date, v.slot)) {
      ctx.addIssue({ code: "custom", path: ["slot"], message: M.slot });
    }
  });
