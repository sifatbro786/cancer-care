/**
 * Create the first super admin, add another admin, or recover a locked/forgotten account.
 * Run on the server (needs MONGODB_URI). The password is typed at a hidden prompt
 * (or ADMIN_PASSWORD env for non-interactive use) — never passed as a CLI argument,
 * so it doesn't end up in shell history or `ps` output.
 *
 *   npm run create-admin -- --email doctor@clinic.com --name "Dr. Farhana Rahman"
 *        → first user ever is super_admin; later users default to admin
 *   npm run create-admin -- --email staff@clinic.com --name "Front Desk" --role admin
 *   npm run create-admin -- --email doctor@clinic.com --reset-password [--activate]
 *        → new password, unlocks, signs out every session (passwordChangedAt)
 */
import { createInterface } from "node:readline";
import { parseArgs } from "node:util";
import bcrypt from "bcryptjs";
import { connectDB, disconnectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models";
import { ROLES } from "@/lib/auth/rbac";
import { emailField, newPasswordField } from "@/lib/validation/auth";

const { values: args } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    role: { type: "string" },
    "reset-password": { type: "boolean", default: false },
    activate: { type: "boolean", default: false },
  },
});

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // Echo the prompt, swallow the typed characters
      rl._writeToOutput = (s) => {
        if (s.startsWith(question)) rl.output.write(question);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

function checkPolicy(password) {
  const check = newPasswordField.safeParse(password);
  if (!check.success) fail(check.error.issues[0].message);
  return password;
}

async function readPassword() {
  if (process.env.ADMIN_PASSWORD) return checkPolicy(process.env.ADMIN_PASSWORD);
  if (!process.stdin.isTTY) fail("No terminal for the password prompt. Set ADMIN_PASSWORD for non-interactive use.");
  const first = checkPolicy(await ask("New password: ", { hidden: true }));
  const second = await ask("Repeat password: ", { hidden: true });
  if (first !== second) fail("Passwords don't match.");
  return first;
}

async function main() {
  const email = emailField.safeParse(args.email ?? "");
  if (!email.success) fail("Pass a valid --email.");

  await connectDB();
  const existing = await User.findOne({ email: email.data }).lean();

  if (args["reset-password"]) {
    if (!existing) fail(`No user with email ${email.data}.`);
    const password = await readPassword();
    await User.updateOne(
      { _id: existing._id },
      {
        $set: {
          passwordHash: await bcrypt.hash(password, 12),
          passwordChangedAt: new Date(),
          failedLogins: 0,
          ...(args.activate ? { active: true } : {}),
        },
        $unset: { lockUntil: 1 },
      }
    );
    console.log(`\n✓ Password reset for ${email.data} — unlocked, all sessions signed out.`);
    if (!existing.active && !args.activate) console.log("  Note: this account is DISABLED. Re-run with --activate to enable it.");
    return;
  }

  if (existing) fail(`${email.data} already exists. Use --reset-password to change its password.`);

  const name = (args.name ?? "").trim();
  if (name.length < 2 || name.length > 80) fail('Pass --name "Full Name" (2–80 characters).');

  const isFirst = (await User.estimatedDocumentCount()) === 0;
  const role = args.role ?? (isFirst ? "super_admin" : "admin");
  if (!ROLES.includes(role)) fail(`--role must be one of: ${ROLES.join(", ")}`);
  if (isFirst && role !== "super_admin") fail("The first user must be a super_admin (someone has to manage the others).");

  const password = await readPassword();
  await User.create({ name, email: email.data, role, passwordHash: await bcrypt.hash(password, 12), active: true });
  console.log(`\n✓ Created ${role} ${email.data}. Sign in at /admin/login\n`);
}

main()
  .catch((err) => {
    console.error("\n✗", err.message);
    process.exitCode = 1;
  })
  .finally(disconnectDB);
