import mongoose, { Schema } from "mongoose";
import { baseOptions, slugField } from "./_shared";

const BlogCategorySchema = new Schema(
  {
    key: slugField,
    label: { type: String, required: true, trim: true, maxlength: 60 },
    order: { type: Number, default: 0 },
  },
  baseOptions
);

BlogCategorySchema.index({ key: 1 }, { unique: true });

export default mongoose.models.BlogCategory || mongoose.model("BlogCategory", BlogCategorySchema);
