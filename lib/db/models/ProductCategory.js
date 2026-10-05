import mongoose, { Schema } from "mongoose";
import { baseOptions, slugField } from "./_shared";

/** Shop category. The "all" filter is UI-only and never stored. */
const ProductCategorySchema = new Schema(
  {
    key: slugField,
    label: { type: String, required: true, trim: true, maxlength: 60 },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  baseOptions
);

ProductCategorySchema.index({ key: 1 }, { unique: true });
ProductCategorySchema.index({ active: 1, order: 1 });

export default mongoose.models.ProductCategory || mongoose.model("ProductCategory", ProductCategorySchema);
