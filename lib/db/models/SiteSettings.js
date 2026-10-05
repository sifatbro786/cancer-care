import mongoose, { Schema } from "mongoose";
import { baseOptions } from "./_shared";

/**
 * Singleton (key: "site") — contact details, address, hours, socials, footer copy,
 * plus small site-wide content blocks (care journey, rating summary).
 * Navigation/route structure stays in code (`data/siteConfig.js`) — it is not content.
 */
const HourSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 60 },
    days: { type: String, required: true, trim: true, maxlength: 60 },
    time: { type: String, required: true, trim: true, maxlength: 60 },
  },
  { _id: false }
);

const SocialSchema = new Schema(
  {
    key: { type: String, required: true, trim: true, maxlength: 30 }, // icon key
    label: { type: String, required: true, trim: true, maxlength: 40 },
    href: { type: String, required: true, trim: true, maxlength: 300 },
  },
  { _id: false }
);

const JourneyStepSchema = new Schema(
  {
    step: { type: String, required: true, maxlength: 4 },
    icon: { type: String, required: true, maxlength: 30 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    text: { type: String, required: true, trim: true, maxlength: 400 },
  },
  { _id: false }
);

/**
 * Site image slot override (B3). Slot keys = keys of data/media.js.
 * No override → the Unsplash default from data/media.js is shown.
 * src/alt/size are snapshotted so public reads need no join.
 */
const ImageOverrideSchema = new Schema(
  {
    key: { type: String, required: true, trim: true, maxlength: 60 },
    media: { type: Schema.Types.ObjectId, ref: "Media", required: true },
    src: { type: String, required: true, maxlength: 500 },
    alt: { type: String, trim: true, maxlength: 200, default: "" },
    width: Number,
    height: Number,
  },
  { _id: false }
);

const SiteSettingsSchema = new Schema(
  {
    key: { type: String, default: "site", immutable: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    shortName: { type: String, trim: true, maxlength: 60 },
    tagline: { type: String, trim: true, maxlength: 160 },
    locale: { type: String, default: "en_BD", maxlength: 10 },

    contact: {
      phone: { type: String, trim: true, maxlength: 30 },
      phoneHref: { type: String, trim: true, maxlength: 40 },
      whatsapp: { type: String, trim: true, maxlength: 20 },
      whatsappMessage: { type: String, trim: true, maxlength: 200 },
      email: { type: String, trim: true, lowercase: true, maxlength: 120 },
      emailHref: { type: String, trim: true, maxlength: 140 },
    },

    address: {
      line1: { type: String, trim: true, maxlength: 120 },
      line2: { type: String, trim: true, maxlength: 120 },
      city: { type: String, trim: true, maxlength: 60 },
      region: { type: String, trim: true, maxlength: 60 },
      postalCode: { type: String, trim: true, maxlength: 12 },
      country: { type: String, trim: true, maxlength: 2 },
      full: { type: String, trim: true, maxlength: 240 },
      geo: { lat: { type: Number, min: -90, max: 90 }, lng: { type: Number, min: -180, max: 180 } },
      mapEmbed: { type: String, trim: true, maxlength: 600 },
      mapLink: { type: String, trim: true, maxlength: 600 },
    },

    hours: { type: [HourSchema], default: [] },
    emergencyNote: { type: String, trim: true, maxlength: 200 },
    social: { type: [SocialSchema], default: [] },
    footer: {
      about: { type: String, trim: true, maxlength: 600 },
      disclaimer: { type: String, trim: true, maxlength: 600 },
    },

    careJourney: { type: [JourneyStepSchema], default: [] },
    imageOverrides: { type: [ImageOverrideSchema], default: [] },
    ratingSummary: {
      average: { type: Number, min: 0, max: 5 },
      count: { type: Number, min: 0 },
      sources: { type: [String], default: [] },
    },
  },
  baseOptions
);

SiteSettingsSchema.index({ key: 1 }, { unique: true });

export default mongoose.models.SiteSettings || mongoose.model("SiteSettings", SiteSettingsSchema);
