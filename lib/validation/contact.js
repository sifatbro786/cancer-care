import { z } from "zod";
import { contactData } from "@/data/contactData";
import {
  bdPhoneField,
  honeypotField,
  messageField,
  nameField,
  optionalEmailField,
} from "@/lib/validation/common";

const subjects = contactData.form.fields.subject.options.map((o) => o.value);

export const contactSchema = z.object({
  name: nameField,
  phone: bdPhoneField,
  email: optionalEmailField,
  subject: z.enum(subjects).default("other"),
  message: messageField(10),
  company: honeypotField,
});
