import mongoose, { Schema } from "mongoose";
import { baseOptions, imageSchema } from "./_shared";

/**
 * Per-route SEO (key = seoData key: "default", "home", "about", ...).
 * The "default" record also carries titleTemplate / ogHeadline / keywords.
 * Wired into lib/seo.js in B6; seeded now so the admin starts with real values.
 */
const PageSeoSchema = new Schema(
  {
    key: { type: String, required: true, trim: true, maxlength: 40, match: /^[a-zA-Z][a-zA-Z0-9-]*$/ },
    path: { type: String, trim: true, maxlength: 200 },
    title: { type: String, trim: true, maxlength: 120, default: null },
    titleTemplate: { type: String, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 300, default: null },
    ogHeadline: { type: String, trim: true, maxlength: 160 },
    ogImage: imageSchema,
    keywords: { type: [String], default: undefined },
    noindex: { type: Boolean, default: false },
  },
  baseOptions
);

PageSeoSchema.index({ key: 1 }, { unique: true });

export default mongoose.models.PageSeo || mongoose.model("PageSeo", PageSeoSchema);
