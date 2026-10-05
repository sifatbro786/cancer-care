import mongoose, { Schema } from "mongoose";
import { baseOptions, notificationSchema, requestMetaSchema } from "./_shared";

export const MESSAGE_STATUSES = ["unread", "read", "archived"];

/** Contact-form message from /contact. `subject` is the contactData option value. */
const MessageSchema = new Schema(
  {
    reference: { type: String, required: true, immutable: true, maxlength: 24 },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, match: /^01[3-9]\d{8}$/ },
    email: { type: String, trim: true, lowercase: true, maxlength: 120 },
    subject: { type: String, required: true, trim: true, maxlength: 40 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },

    status: { type: String, enum: MESSAGE_STATUSES, default: "unread" },
    readAt: Date,
    readBy: { type: Schema.Types.ObjectId, ref: "User" },
    notification: { type: notificationSchema, default: () => ({}) },
    meta: { type: requestMetaSchema, default: () => ({}) },
  },
  baseOptions
);

MessageSchema.index({ reference: 1 }, { unique: true });
MessageSchema.index({ status: 1, createdAt: -1 });
MessageSchema.index({ createdAt: -1 });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
