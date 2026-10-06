import mongoose, { Schema } from "mongoose";
import { ROLES } from "@/lib/auth/rbac";
import { baseOptions } from "./_shared";

/**
 * Dashboard user. Auth logic (bcrypt, JWT, lockout) arrives in B2 —
 * the fields it needs are defined now so no migration is required later.
 * `passwordHash` is never selected unless asked for with `.select("+passwordHash")`.
 */
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "admin", required: true }, // single source: lib/auth/rbac.js
    active: { type: Boolean, default: true },

    // Login hardening (B2)
    failedLogins: { type: Number, default: 0 },
    lockUntil: Date,
    lastLoginAt: Date,
    // Any JWT issued before this instant is rejected → "log out everywhere" on password change
    passwordChangedAt: Date,
    // Set when a super admin creates the account or resets the password (B6) — cleared on change
    mustChangePassword: { type: Boolean, default: false },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    ...baseOptions,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, active: 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);
