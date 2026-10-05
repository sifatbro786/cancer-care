import { Schema } from "mongoose";

/**
 * Shared sub-schemas & helpers for every model.
 * Sub-documents use `_id: false` — they are value objects, not entities,
 * and it keeps the public JSON shape identical to `data/*.js`.
 */

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugField = {
  type: String,
  required: true,
  trim: true,
  lowercase: true,
  maxlength: 120,
  match: SLUG_RE,
};

/** Image reference — `src` is a remote URL now, `/uploads/...` after B3. */
export const imageSchema = new Schema(
  {
    src: { type: String, required: true, trim: true, maxlength: 500 },
    alt: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { _id: false }
);

/** Admin note / audit trail entry (appointments, orders). `by` = User id. */
export const noteSchema = new Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    by: { type: Schema.Types.ObjectId, ref: "User" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

/** Outcome of the notification email — the DB record is the source of truth, email is a side-effect. */
export const notificationSchema = new Schema(
  {
    clinicEmailed: { type: Boolean, default: false },
    emailedAt: Date,
  },
  { _id: false }
);

/** Request metadata kept for abuse investigation only. */
export const requestMetaSchema = new Schema(
  {
    ip: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 300 },
  },
  { _id: false }
);

export const baseOptions = { timestamps: true, versionKey: "__v" };
