import mongoose, { Schema } from "mongoose";
import { baseOptions, noteSchema, notificationSchema, requestMetaSchema } from "./_shared";

export const APPOINTMENT_STATUSES = ["new", "confirmed", "completed", "cancelled"];

/**
 * Appointment request from /appointment.
 * `date` + `slot` are kept exactly as the patient chose them (Asia/Dhaka wall time);
 * `startsAt` is the same instant as a real Date for sorting / range queries.
 * Service title is snapshotted — renaming a service later must not rewrite history.
 */
const AppointmentSchema = new Schema(
  {
    reference: { type: String, required: true, immutable: true, maxlength: 24 },
    type: { type: String, enum: ["chamber", "online"], required: true },
    service: {
      slug: { type: String, maxlength: 120 },
      title: { type: String, maxlength: 120 },
    },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    slot: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
    startsAt: { type: Date, required: true },

    patient: {
      name: { type: String, required: true, trim: true, maxlength: 80 },
      phone: { type: String, required: true, match: /^01[3-9]\d{8}$/ },
      email: { type: String, trim: true, lowercase: true, maxlength: 120 },
      age: { type: Number, min: 1, max: 120 },
    },
    visit: { type: String, enum: ["new", "follow-up"], default: "new" },
    message: { type: String, trim: true, maxlength: 1000 },
    consentAt: { type: Date, required: true },

    status: { type: String, enum: APPOINTMENT_STATUSES, default: "new" },
    notes: { type: [noteSchema], default: [] },
    notification: { type: notificationSchema, default: () => ({}) },
    meta: { type: requestMetaSchema, default: () => ({}) },
  },
  baseOptions
);

AppointmentSchema.index({ reference: 1 }, { unique: true });
AppointmentSchema.index({ status: 1, startsAt: 1 }); // admin inbox: "new, upcoming first"
AppointmentSchema.index({ startsAt: 1 }); // day/slot views
AppointmentSchema.index({ "patient.phone": 1, createdAt: -1 }); // patient history lookup
AppointmentSchema.index({ createdAt: -1 });

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);
