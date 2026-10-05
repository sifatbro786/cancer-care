import mongoose, { Schema } from "mongoose";
import { baseOptions } from "./_shared";

const FaqSchema = new Schema(
  {
    q: { type: String, required: true, trim: true, maxlength: 300 },
    a: { type: String, required: true, trim: true, maxlength: 2000 },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  baseOptions
);

FaqSchema.index({ active: 1, order: 1 });
FaqSchema.index({ q: 1 }, { unique: true }); // natural key for idempotent seeding

export default mongoose.models.Faq || mongoose.model("Faq", FaqSchema);
