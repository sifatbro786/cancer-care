import mongoose, { Schema } from "mongoose";
import { baseOptions } from "./_shared";

/**
 * Media library — admin-uploaded PUBLIC images only (B3).
 * Every upload is re-encoded to WebP by lib/server/media.js and stored under MEDIA_DIR,
 * served at /media/YYYY/MM/<uuid>.webp. Private files (prescriptions) never live here.
 * Site image slots point at these via SiteSettings.imageOverrides.
 */
const MediaSchema = new Schema(
  {
    url: { type: String, required: true, trim: true, maxlength: 300 }, // public URL, e.g. /media/2026/10/<uuid>.webp
    path: { type: String, required: true, trim: true, maxlength: 300 }, // relative to MEDIA_DIR
    alt: { type: String, trim: true, maxlength: 200, default: "" },
    originalName: { type: String, trim: true, maxlength: 160 },
    mime: { type: String, default: "image/webp", maxlength: 40 },
    size: { type: Number, min: 0 },
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  baseOptions
);

MediaSchema.index({ url: 1 }, { unique: true });
MediaSchema.index({ createdAt: -1 });

export default mongoose.models.Media || mongoose.model("Media", MediaSchema);
