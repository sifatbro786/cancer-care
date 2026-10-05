import mongoose, { Schema } from "mongoose";
import { baseOptions } from "./_shared";

/**
 * Media library entry (B3 fills `path`/dimensions on upload).
 * `key` = optional stable slot name from data/media.js ("hero", "doctorPortrait"…)
 * so a slot can be re-pointed to a new upload without touching code.
 * Private files (prescriptions) are NOT stored here — they live on the Order.
 */
const MediaSchema = new Schema(
  {
    key: { type: String, trim: true, maxlength: 60 },
    url: { type: String, required: true, trim: true, maxlength: 500 },
    path: { type: String, trim: true, maxlength: 300 }, // relative path under public/uploads (local files only)
    alt: { type: String, trim: true, maxlength: 200, default: "" },
    mime: { type: String, trim: true, maxlength: 60 },
    size: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    source: { type: String, enum: ["upload", "remote"], default: "remote" },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  baseOptions
);

MediaSchema.index({ key: 1 }, { unique: true, sparse: true }); // uploads without a slot have no key
MediaSchema.index({ createdAt: -1 });

export default mongoose.models.Media || mongoose.model("Media", MediaSchema);
