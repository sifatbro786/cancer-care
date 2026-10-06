import "server-only";
import { randomInt } from "node:crypto";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models";
import { hashPassword } from "@/lib/auth/password";
import { ROLES } from "@/lib/auth/rbac";

/**
 * Admin user management (B6) — super_admin only; callers MUST have run
 * authorize(PERMISSIONS.usersManage). Guard rails enforced HERE, not in the UI:
 *  - nobody can disable, demote or reset themselves from this screen (use Account)
 *  - the last active super admin can't be disabled or demoted
 * New accounts and resets get a server-generated temporary password, shown once;
 * `mustChangePassword` keeps a banner up until the person picks their own.
 */

// No look-alikes (0/O, 1/l/I). 16 chars ≈ 80 bits; dashes for reading it out over the phone.
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateTempPassword() {
  const chars = Array.from({ length: 16 }, () => ALPHABET[randomInt(ALPHABET.length)]);
  return [0, 4, 8, 12].map((i) => chars.slice(i, i + 4).join("")).join("-");
}

const dto = (u, now = Date.now()) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  role: u.role,
  active: Boolean(u.active),
  locked: Boolean(u.lockUntil && u.lockUntil.getTime() > now),
  mustChangePassword: Boolean(u.mustChangePassword),
  lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
  createdAt: u.createdAt ? u.createdAt.toISOString() : null,
});

export async function listUsers() {
  await connectDB();
  const users = await User.find()
    .select("name email role active lockUntil mustChangePassword lastLoginAt createdAt")
    .sort({ active: -1, role: -1, name: 1 })
    .lean();
  return users.map((u) => dto(u));
}

async function activeSuperAdmins() {
  return User.countDocuments({ role: "super_admin", active: true });
}

/**
 * Re-check AFTER the write and roll it back if no active super admin is left.
 * Closes the race where two super admins demote/disable each other at the same moment:
 * both writes land, both re-checks see zero, both roll back — never a locked-out system.
 */
async function keepsASuperAdmin(userId, restore) {
  if ((await activeSuperAdmins()) > 0) return true;
  await User.updateOne({ _id: userId }, { $set: restore });
  return false;
}

async function loadTarget(id, actorId) {
  if (!isValidObjectId(id)) return { error: { ok: false, code: "notFound" } };
  if (String(id) === String(actorId)) return { error: { ok: false, code: "self" } };
  const user = await User.findById(id).select("name email role active").lean();
  if (!user) return { error: { ok: false, code: "notFound" } };
  return { user };
}

export async function createUser({ name, email, role, actorId }) {
  if (!ROLES.includes(role)) return { ok: false, code: "invalid" };
  await connectDB();
  const tempPassword = generateTempPassword();
  try {
    const doc = await User.create({
      name,
      email,
      role,
      passwordHash: await hashPassword(tempPassword),
      mustChangePassword: true,
      active: true,
      createdBy: actorId,
    });
    return { ok: true, user: { id: String(doc._id), name: doc.name, email: doc.email, role: doc.role }, tempPassword };
  } catch (err) {
    if (err?.code === 11000) return { ok: false, code: "emailTaken" };
    throw err;
  }
}

export async function setActive({ id, active, actorId }) {
  await connectDB();
  const { user, error } = await loadTarget(id, actorId);
  if (error) return error;
  if (user.active === active) return { ok: true, user, changed: false };
  if (!active && user.role === "super_admin" && (await activeSuperAdmins()) <= 1) return { ok: false, code: "lastSuper" };
  // Disabling takes effect on the person's next request: getCurrentUser() re-reads `active`
  await User.updateOne({ _id: user._id }, { $set: { active } });
  if (!active && user.role === "super_admin" && !(await keepsASuperAdmin(user._id, { active: true }))) {
    return { ok: false, code: "lastSuper" };
  }
  return { ok: true, user, changed: true };
}

export async function setRole({ id, role, actorId }) {
  if (!ROLES.includes(role)) return { ok: false, code: "invalid" };
  await connectDB();
  const { user, error } = await loadTarget(id, actorId);
  if (error) return error;
  if (user.role === role) return { ok: true, user, changed: false };
  if (user.role === "super_admin" && user.active && (await activeSuperAdmins()) <= 1) return { ok: false, code: "lastSuper" };
  await User.updateOne({ _id: user._id }, { $set: { role } }); // role is read from the DB on every request
  if (user.role === "super_admin" && !(await keepsASuperAdmin(user._id, { role: "super_admin" }))) {
    return { ok: false, code: "lastSuper" };
  }
  return { ok: true, user, changed: true, from: user.role };
}

/** New temporary password; signs the person out everywhere and clears any lockout. */
export async function resetPassword({ id, actorId }) {
  await connectDB();
  const { user, error } = await loadTarget(id, actorId);
  if (error) return error;
  const tempPassword = generateTempPassword();
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordHash: await hashPassword(tempPassword),
        passwordChangedAt: new Date(),
        mustChangePassword: true,
        failedLogins: 0,
      },
      $unset: { lockUntil: 1 },
    }
  );
  return { ok: true, user, tempPassword };
}

export async function unlockUser({ id, actorId }) {
  await connectDB();
  const { user, error } = await loadTarget(id, actorId);
  if (error) return error;
  await User.updateOne({ _id: user._id }, { $set: { failedLogins: 0 }, $unset: { lockUntil: 1 } });
  return { ok: true, user };
}
