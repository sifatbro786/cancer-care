import mongoose, { Schema } from "mongoose";

/**
 * Append-only audit trail (B6). Written by lib/server/audit.js — never updated or deleted
 * by the app. Actor name/email are snapshotted so the log still reads correctly after a
 * user is renamed or removed. Entries expire after 400 days (TTL index).
 */
const AuditLogSchema = new Schema(
  {
    action: { type: String, required: true, trim: true, maxlength: 60 }, // "content.update", "auth.login_failed"
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    actorName: { type: String, trim: true, maxlength: 120 },
    actorEmail: { type: String, trim: true, maxlength: 120 },
    target: {
      type: { type: String, trim: true, maxlength: 40 }, // "services", "order", "user"…
      id: { type: String, trim: true, maxlength: 40 },
      label: { type: String, trim: true, maxlength: 200 },
    },
    meta: { type: Schema.Types.Mixed }, // small, non-sensitive details (status from/to, field names)
    ip: { type: String, maxlength: 64 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ actor: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 400 * 24 * 3600, name: "ttl_400d" });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
