import mongoose, { Schema } from "mongoose";
import { baseOptions, imageSchema, slugField } from "./_shared";

/** Medicine. Money is integer BDT — never floats. */
const money = {
  type: Number,
  required: true,
  min: 0,
  validate: { validator: Number.isInteger, message: "Amount must be an integer (BDT)." },
};

const ProductSchema = new Schema(
  {
    slug: slugField,
    sku: { type: String, trim: true, maxlength: 40 },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    generic: { type: String, trim: true, maxlength: 160, default: "" },
    category: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 }, // ProductCategory.key
    manufacturer: { type: String, trim: true, maxlength: 120 },
    pack: { type: String, trim: true, maxlength: 120 },
    price: money,
    mrp: money,
    requiresPrescription: { type: Boolean, default: true }, // safe default
    inStock: { type: Boolean, default: true },
    coldChain: { type: Boolean, default: false },
    image: imageSchema,
    description: { type: String, trim: true, maxlength: 2000 },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  baseOptions
);

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ sku: 1 }, { unique: true, sparse: true });
ProductSchema.index({ active: 1, category: 1, order: 1 });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
