import mongoose, { Schema } from "mongoose";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/validation/order";
import { baseOptions, noteSchema, notificationSchema, requestMetaSchema } from "./_shared";

export const ORDER_STATUSES = ["new", "processing", "dispatched", "delivered", "cancelled"];

/**
 * Medicine order from /shop (no prescription upload — owner decision 2026-10-12).
 * Line items snapshot name + unit price at order time (server-side price, never client).
 * `items` is an array so a cart can arrive later without a migration.
 *
 * Payment: `payment.amount` is fixed when the order is placed. Every gateway attempt
 * (bKash paymentID / Nagad payment_ref_id) is kept in `payment.sessions`, so a callback
 * for an older attempt (two tabs, slow redirect) still finds its order.
 */
const int = { type: Number, min: 0, validate: { validator: Number.isInteger, message: "Must be an integer." } };

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    slug: { type: String, required: true, maxlength: 120 },
    name: { type: String, required: true, maxlength: 160 },
    unitPrice: { ...int, required: true },
    quantity: { type: Number, required: true, min: 1, max: 20 },
    coldChain: { type: Boolean, default: false },
  },
  { _id: false }
);

const PaymentSessionSchema = new Schema(
  {
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    gatewayRef: { type: String, required: true, maxlength: 120 }, // bKash paymentID / Nagad payment_ref_id
    gatewayOrderId: { type: String, maxlength: 60 }, // our invoice / order id sent to the gateway
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PaymentSchema = new Schema(
  {
    method: { type: String, enum: PAYMENT_METHODS, default: "offline" },
    status: { type: String, enum: PAYMENT_STATUSES, default: "unpaid" },
    amount: { ...int, default: 0 }, // BDT due, fixed at order time
    attempts: { type: Number, default: 0, min: 0 },
    sessions: { type: [PaymentSessionSchema], default: [] },
    trxId: { type: String, trim: true, maxlength: 80 }, // gateway transaction id or the receipt no. staff typed
    payer: { type: String, trim: true, maxlength: 20 }, // wallet number reported by the gateway
    paidAt: Date,
    receivedBy: { type: Schema.Types.ObjectId, ref: "User" }, // set when staff mark an offline payment
    lastError: { type: String, trim: true, maxlength: 300 },
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

    payment: { type: PaymentSchema, default: () => ({}) },

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
OrderSchema.index({ "payment.sessions.gatewayRef": 1 }); // gateway callback → order
OrderSchema.index({ "payment.status": 1, createdAt: -1 });
OrderSchema.index({ "customer.phone": 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
