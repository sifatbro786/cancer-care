import mongoose, { Schema } from "mongoose";
import { baseOptions, imageSchema, slugField } from "./_shared";

/** Doctor profile. Single doctor today (key: "primary"); the schema allows more later. */
const DoctorSchema = new Schema(
  {
    key: { type: String, default: "primary", trim: true, maxlength: 40 },
    slug: slugField,
    name: { type: String, required: true, trim: true, maxlength: 100 },
    honorific: { type: String, trim: true, maxlength: 20 },
    shortTitle: { type: String, trim: true, maxlength: 120 },
    designation: { type: String, trim: true, maxlength: 200 },
    degrees: { type: [String], default: [] },
    bmdcReg: { type: String, trim: true, maxlength: 30 },
    photo: imageSchema,

    affiliations: {
      type: [
        new Schema(
          {
            name: { type: String, required: true, trim: true, maxlength: 160 },
            role: { type: String, trim: true, maxlength: 160 },
            period: { type: String, trim: true, maxlength: 40 },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    stats: {
      type: [
        new Schema(
          {
            value: { type: Number, required: true },
            suffix: { type: String, trim: true, maxlength: 6, default: "" },
            label: { type: String, required: true, trim: true, maxlength: 80 },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    summary: { type: String, trim: true, maxlength: 600 },
    bio: { type: [String], default: [] },
    specialties: { type: [String], default: [] },
    training: {
      type: [
        new Schema(
          {
            year: { type: String, trim: true, maxlength: 10 },
            title: { type: String, required: true, trim: true, maxlength: 160 },
            place: { type: String, trim: true, maxlength: 160 },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    memberships: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    philosophy: {
      quote: { type: String, trim: true, maxlength: 400 },
      signature: { type: String, trim: true, maxlength: 80 },
    },
  },
  baseOptions
);

DoctorSchema.index({ key: 1 }, { unique: true });
DoctorSchema.index({ slug: 1 }, { unique: true });

export default mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
