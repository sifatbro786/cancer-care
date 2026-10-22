import "server-only";
import { siteConfig } from "@/data/siteConfig";

/**
 * Minimal, table-based email layout (renders in Gmail / Outlook / mobile).
 * EVERY user-supplied value passes through `esc()` — emails are an XSS
 * vector too (webmail clients render HTML).
 */
const esc = (v) =>
  String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const nl2br = (v) => esc(v).replace(/\r?\n/g, "<br>");

/** Absolute link to an admin record (clinic emails only — never in patient emails). Ids only, no PII. */
export const adminUrl = (path) => `${siteConfig.url.replace(/\/$/, "")}${path}`;

function layout({ heading, intro, rows, footer, action }) {
  const rowsHtml = rows
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) => `<tr>
        <td style="padding:10px 14px;border-bottom:1px solid #e6e1d7;color:#706468;font-size:13px;width:34%;vertical-align:top">${esc(k)}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e6e1d7;color:#2f2429;font-size:15px;vertical-align:top">${nl2br(v)}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html><html><body style="margin:0;background:#faf8f4;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f4;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e6e1d7;border-radius:12px;overflow:hidden">
        <tr><td style="background:#5d0a37;padding:18px 24px;color:#ffffff;font-size:16px;font-weight:bold">${esc(siteConfig.name)}</td></tr>
        <tr><td style="padding:24px 24px 8px">
          <h1 style="margin:0 0 8px;font-size:20px;color:#2f2429">${esc(heading)}</h1>
          ${intro ? `<p style="margin:0;color:#5f5357;font-size:15px;line-height:1.6">${esc(intro)}</p>` : ""}
        </td></tr>
        <tr><td style="padding:12px 10px 20px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
        </td></tr>
        ${
          action
            ? `<tr><td style="padding:0 24px 24px"><a href="${esc(action.href)}" style="display:inline-block;background:#a8246a;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:12px 20px;border-radius:10px">${esc(action.label)}</a></td></tr>`
            : ""
        }
        <tr><td style="padding:16px 24px;background:#f2eee6;color:#706468;font-size:12px;line-height:1.6">
          ${footer ? `${esc(footer)}<br>` : ""}${esc(siteConfig.contact.phone)} · ${esc(siteConfig.address.full)}
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

const toText = (heading, rows, action) =>
  [heading, "", ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`), ...(action ? ["", `${action.label}: ${action.href}`] : [])].join(
    "\n"
  );

const OPEN = "Open in admin";

/* ------------------------------------------------------------------ */

export function appointmentEmails(a) {
  const rows = [
    ["Reference", a.reference],
    ["Consultation", a.typeLabel],
    ["Day", a.dateLabel],
    ["Time", a.slotLabel],
    ["Service", a.serviceLabel],
    ["Patient", a.name],
    ["Mobile", a.phone],
    ["Email", a.email],
    ["Age", a.age],
    ["Visit", a.visit === "follow-up" ? "Follow-up" : "First visit"],
    ["Message", a.message],
  ];
  const clinicHeading = `New appointment request — ${a.typeLabel}`;
  const patientRows = rows.filter(([k]) => ["Reference", "Consultation", "Day", "Time", "Patient"].includes(k));
  const patientHeading = "We've received your appointment request";
  const patientIntro = "This is not yet a confirmation. Our team will call you within working hours to confirm the time.";

  return {
    clinic: {
      subject: `Appointment request · ${a.name} · ${a.dateLabel} ${a.slotLabel} [${a.reference}]`,
      html: layout({ heading: clinicHeading, rows, footer: "Call the patient to confirm.", action: a.adminPath && { label: OPEN, href: adminUrl(a.adminPath) } }),
      text: toText(clinicHeading, rows, a.adminPath && { label: OPEN, href: adminUrl(a.adminPath) }),
    },
    patient: a.email
      ? {
          subject: `Your appointment request [${a.reference}]`,
          html: layout({ heading: patientHeading, intro: patientIntro, rows: patientRows }),
          text: toText(patientHeading, patientRows),
        }
      : null,
  };
}

export function contactEmail(c) {
  const rows = [
    ["Name", c.name],
    ["Mobile", c.phone],
    ["Email", c.email],
    ["Subject", c.subjectLabel],
    ["Message", c.message],
  ];
  const heading = `Website message — ${c.subjectLabel}`;
  return {
    subject: `Contact · ${c.name} · ${c.subjectLabel}`,
    html: layout({ heading, rows, action: c.adminPath && { label: OPEN, href: adminUrl(c.adminPath) } }),
    text: toText(heading, rows, c.adminPath && { label: OPEN, href: adminUrl(c.adminPath) }),
  };
}

const money = (n) => `৳${String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

export function orderEmail(o) {
  const rows = [
    ["Reference", o.reference],
    ["Medicine", o.productLabel],
    ["Quantity", o.quantity],
    ["Amount", money(o.amount)],
    ["Payment", o.paymentLabel],
    ["Patient", o.name],
    ["Mobile", o.phone],
    ["Address", o.address],
    ["Note", o.note],
  ];
  const heading = "New medicine order";
  return {
    subject: `Order · ${o.name} · ${o.productLabel} [${o.reference}]`,
    html: layout({
      heading,
      rows,
      footer: "Call the customer to confirm before dispatch.",
      action: o.adminPath && { label: OPEN, href: adminUrl(o.adminPath) },
    }),
    text: toText(heading, rows, o.adminPath && { label: OPEN, href: adminUrl(o.adminPath) }),
  };
}

/** Clinic notice when an online payment is confirmed by the gateway. */
export function paymentEmail(p) {
  const rows = [
    ["Reference", p.reference],
    ["Paid with", p.methodLabel],
    ["Amount", money(p.amount)],
    ["Transaction ID", p.trxId],
  ];
  const heading = "Online payment received";
  return {
    subject: `Payment received · ${p.methodLabel} · ${money(p.amount)} [${p.reference}]`,
    html: layout({ heading, rows, action: p.adminPath && { label: OPEN, href: adminUrl(p.adminPath) } }),
    text: toText(heading, rows, p.adminPath && { label: OPEN, href: adminUrl(p.adminPath) }),
  };
}
