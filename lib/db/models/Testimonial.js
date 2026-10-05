import mongoose, { Schema } from "mongoose";
import { baseOptions } from "./_shared";

/** Privacy: initials + relationship only — never full names or diagnoses without written consent. */
const TestimonialSchema = new Schema(
  {
    quote: { type: String, required: true, trim: true, maxlength: 800 },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    relation: { type: String, trim: true, maxlength: 60 },
    location: { type: String, trim: true, maxlength: 60 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    source: { type: String, enum: ["facebook", "google", "direct"], default: "direct" },
    approved: { type: Boolean, default: false }, // moderated in B5
    order: { type: Number, default: 0 },
  },
  baseOptions
);

TestimonialSchema.index({ approved: 1, order: 1 });

export default mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema);
