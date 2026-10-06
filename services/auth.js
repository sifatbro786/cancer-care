import "server-only";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { User } from "@/lib/db/models";
import { getSigningKey, LOCKOUT } from "@/lib/auth/config";
import { burnPasswordCheck, hashPassword, verifyPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/server/rateLimit";

/**
 * Credential checks (DAL). Server Actions stay thin and call these.
 *
 * Brute-force layers:
 *   1. per IP          — 20 attempts / 15 min (in memory)
 *   2. per email       — LOCKOUT.maxFailures attempts / 15 min (in memory) → identical response
 *                        for real and non-existent accounts (no enumeration by lockout)
 *   3. per account     — LOCKOUT.maxFailures failures → lockUntil in the DB (survives restarts)
 * All failures return one generic message; unknown emails still pay the bcrypt cost.
 */

const WINDOW = 15 * 60 * 1000;
const minutesFrom = (ms) => Math.max(1, Math.ceil(ms / 60_000));

export async function attemptLogin({ email, password, ip }) {
  if (!getSigningKey() || !isDbConfigured()) return { ok: false, code: "config" };

  const byIp = rateLimit(`login-ip:${ip}`, { limit: 20, windowMs: WINDOW });
  if (!byIp.ok) return { ok: false, code: "rateLimited" };

  const byEmail = rateLimit(`login-email:${email}`, { limit: LOCKOUT.maxFailures, windowMs: WINDOW });
  if (!byEmail.ok) return { ok: false, code: "locked", minutes: minutesFrom(byEmail.retryAfter * 1000) };

  await connectDB();
  const user = await User.findOne({ email }).select("+passwordHash role active lockUntil failedLogins").lean();

  if (!user) {
    await burnPasswordCheck(password);
    return { ok: false, code: "invalid" };
  }

  const now = Date.now();
  if (user.lockUntil && user.lockUntil.getTime() > now) {
    return { ok: false, code: "locked", minutes: minutesFrom(user.lockUntil.getTime() - now) };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    // $inc is atomic, so parallel guesses all count; whichever request sees ≥ max sets the lock
    await User.updateOne({ _id: user._id }, { $inc: { failedLogins: 1 } });
    const updated = await User.findById(user._id).select("failedLogins").lean();
    if (updated && updated.failedLogins >= LOCKOUT.maxFailures) {
      await User.updateOne(
        { _id: user._id },
        { $set: { lockUntil: new Date(now + LOCKOUT.minutes * 60_000), failedLogins: 0 } }
      );
      console.warn(`[auth] account locked for ${LOCKOUT.minutes} min after repeated failures (user ${user._id})`);
      return { ok: false, code: "locked", minutes: LOCKOUT.minutes };
    }
    return { ok: false, code: "invalid" };
  }

  // Checked only AFTER a correct password, so a disabled account looks like any other failure
  if (!user.active) return { ok: false, code: "invalid" };

  await User.updateOne(
    { _id: user._id },
    { $set: { failedLogins: 0, lastLoginAt: new Date(now) }, $unset: { lockUntil: 1 } }
  );
  console.info(`[auth] sign-in ok (user ${user._id}, ip ${ip})`);
  return { ok: true, user: { id: String(user._id), role: user.role } };
}

/** Verifies the current password, stores the new hash, stamps passwordChangedAt (revokes older tokens). */
export async function changePassword({ userId, current, next }) {
  const limit = rateLimit(`pw-change:${userId}`, { limit: 5, windowMs: WINDOW });
  if (!limit.ok) return { ok: false, code: "rateLimited" };

  await connectDB();
  const user = await User.findById(userId).select("+passwordHash active").lean();
  if (!user?.active) return { ok: false, code: "invalid" };

  if (!(await verifyPassword(current, user.passwordHash))) return { ok: false, code: "currentWrong" };

  await User.updateOne(
    { _id: user._id },
    { $set: { passwordHash: await hashPassword(next), passwordChangedAt: new Date(), mustChangePassword: false } }
  );
  console.info(`[auth] password changed (user ${user._id})`);
  return { ok: true };
}
