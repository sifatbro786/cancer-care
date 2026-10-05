import mongoose, { Schema } from "mongoose";
import { baseOptions, imageSchema, slugField } from "./_shared";

const ServiceSchema = new Schema(
  {
    slug: slugField,
    icon: { type: String, required: true, trim: true, maxlength: 30 }, // key for lib/icons.jsx
    title: { type: String, required: true, trim: true, maxlength: 120 },
    short: { type: String, trim: true, maxlength: 300 },
    image: imageSchema,
    highlights: { type: [String], default: [] },
    details: {
      intro: { type: String, trim: true, maxlength: 1000 },
      steps: { type: [String], default: undefined }, // optional block — absent unless used
      precautions: { type: [String], default: [] },
      facilities: { type: [String], default: [] },
    },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  baseOptions
);

ServiceSchema.index({ slug: 1 }, { unique: true });
ServiceSchema.index({ active: 1, order: 1 });

export default mongoose.models.Service || mongoose.model("Service", ServiceSchema);
