import "server-only";
import bcrypt from "bcryptjs";

/**
 * bcrypt (pure JS, no native build on Windows/VPS). Cost 12 ≈ 250 ms — slow enough to
 * hurt offline cracking, fast enough for a handful of admin logins a day.
 * bcrypt only reads the first 72 BYTES — the policy rejects longer passwords instead of
 * silently truncating them (lib/validation/auth.js).
 */
const COST = 12;

export const hashPassword = (plain) => bcrypt.hash(plain, COST);

export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

/**
 * Constant-ish timing for unknown emails: compare against a real hash so
 * "no such user" takes as long as "wrong password" (no user enumeration by timing).
 */
let dummyHash;
export async function burnPasswordCheck(plain) {
  dummyHash ??= await bcrypt.hash("timing-equaliser-not-a-real-password", COST);
  await bcrypt.compare(plain, dummyHash);
  return false;
}
