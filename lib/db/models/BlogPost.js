import mongoose, { Schema } from "mongoose";
import { baseOptions, imageSchema, slugField } from "./_shared";

export const BLOG_BLOCK_TYPES = ["heading", "paragraph", "list", "callout"];
export const BLOG_STATUSES = ["draft", "published"];

/** Typed content block — same structure the block editor (B5) will write. */
const BlockSchema = new Schema(
  {
    type: { type: String, enum: BLOG_BLOCK_TYPES, required: true },
    text: { type: String, trim: true, maxlength: 5000 },
    items: { type: [String], default: undefined },
  },
  { _id: false }
);

const BlogPostSchema = new Schema(
  {
    slug: slugField,
    title: { type: String, required: true, trim: true, maxlength: 200 },
    excerpt: { type: String, trim: true, maxlength: 400 },
    category: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 }, // BlogCategory.key
    author: { type: String, trim: true, maxlength: 100 },
    cover: imageSchema,
    content: { type: [BlockSchema], default: [] },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: BLOG_STATUSES, default: "draft" },
    publishedAt: Date, // set when published; future date = scheduled
    seo: {
      title: { type: String, trim: true, maxlength: 70 },
      description: { type: String, trim: true, maxlength: 170 },
    },
  },
  baseOptions
);

BlogPostSchema.index({ slug: 1 }, { unique: true });
// Public listing: published, newest first (featured filter rides the same index prefix)
BlogPostSchema.index({ status: 1, publishedAt: -1 });
BlogPostSchema.index({ status: 1, featured: 1, publishedAt: -1 });

export default mongoose.models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);
