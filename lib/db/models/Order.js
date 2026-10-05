import mongoose, { Schema } from "mongoose";
import { baseOptions, noteSchema, notificationSchema, requestMetaSchema } from "./_shared";

export const ORDER_STATUSES = ["new", "processing", "dispatched", "delivered", "cancelled"];
export const PRESCRIPTION_STATUSES = ["not_required", "pending", "verified", "rejected"];

/**
 * Medicine order / prescription request from /shop.
 * Line items snapshot name + unit price at order time (server-side price, never client).
 * `items` is an array so a cart can arrive later without a migration;
 * an empty array = "medicines as per attached prescription".
 *
 * Prescription file lives in PRIVATE storage (outside /public);
 * only its relative path + checksum are stored here.
 */
const int = { type: Number, min: 0, validate: { validator: Number.isInteger, message: "Must be an integer." } };

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    slug: { type: String, required: true, maxlength: 120 },
    name: { type: String, required: true, maxlength: 160 },
    unitPrice: { ...int, required: true },
    quantity: { type: Number, required: true, min: 1, max: 20 },
    requiresPrescription: { type: Boolean, default: true },
    coldChain: { type: Boolean, default: false },
  },
  { _id: false }
);

const PrescriptionFileSchema = new Schema(
  {
    path: { type: String, required: true, maxlength: 300 }, // relative to PRIVATE_STORAGE_DIR
    mime: { type: String, required: true, maxlength: 60 },
    size: { type: Number, required: true, min: 1 },
    sha256: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
  },
  { _id: false }
);

const StatusEventSchema = new Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    by: { type: Schema.Types.ObjectId, ref: "User" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    reference: { type: String, required: true, immutable: true, maxlength: 24 },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { ...int, default: 0 }, // BDT; delivery/discount are confirmed on the phone call

    customer: {
      name: { type: String, required: true, trim: true, maxlength: 80 },
      phone: { type: String, required: true, match: /^01[3-9]\d{8}$/ },
      address: { type: String, required: true, trim: true, maxlength: 240 },
    },
    note: { type: String, trim: true, maxlength: 1000 },

    prescription: {
      required: { type: Boolean, default: false },
      status: { type: String, enum: PRESCRIPTION_STATUSES, default: "not_required" },
      file: PrescriptionFileSchema,
      reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
      reviewedAt: Date,
      rejectReason: { type: String, trim: true, maxlength: 500 },
    },

    status: { type: String, enum: ORDER_STATUSES, default: "new" },
    statusHistory: { type: [StatusEventSchema], default: () => [{ status: "new" }] },
    notes: { type: [noteSchema], default: [] },
    notification: { type: notificationSchema, default: () => ({}) },
    meta: { type: requestMetaSchema, default: () => ({}) },
  },
  baseOptions
);

OrderSchema.index({ reference: 1 }, { unique: true });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ "prescription.status": 1, createdAt: -1 }); // "prescriptions to verify" queue
OrderSchema.index({ "customer.phone": 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
