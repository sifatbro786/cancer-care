import "server-only";
import nodemailer from "nodemailer";

/**
 * Nodemailer transport — created once per server instance and reused.
 *
 * Env (see .env.example): SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO.
 * In development without SMTP vars, falls back to `jsonTransport` (logs the
 * message instead of sending) so forms can be tested end-to-end locally.
 * In production, missing config is a hard error → the API answers 502.
 */
function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (process.env.NODE_ENV === "production") return null;
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 465),
    secure: String(SMTP_SECURE ?? "true") === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    pool: true,
    maxConnections: 3,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
}

const transport = globalThis.__ccMailer ?? (globalThis.__ccMailer = createTransport());

export const isDevTransport = !process.env.SMTP_HOST;

/**
 * Send one email. Returns true on success, false on failure (already logged).
 * Never throws — callers decide the HTTP response.
 */
export async function sendMail({ to, subject, html, text, replyTo, attachments }) {
  if (!transport) {
    console.error("[mail] SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS).");
    return false;
  }
  try {
    const info = await transport.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER || "Cancer Care <no-reply@localhost>",
      to: to || process.env.MAIL_TO,
      subject,
      html,
      text,
      replyTo,
      attachments,
    });
    if (isDevTransport) console.info(`[mail:dev] "${subject}" → ${to || process.env.MAIL_TO || "(MAIL_TO unset)"}`);
    return Boolean(info?.messageId);
  } catch (err) {
    console.error("[mail] send failed:", err?.message);
    return false;
  }
}
