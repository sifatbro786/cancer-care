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

function layout({ heading, intro, rows, footer }) {
  const rowsHtml = rows
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) => `<tr>
        <td style="padding:10px 14px;border-bottom:1px solid #e6e1d7;color:#5c6b6d;font-size:13px;width:34%;vertical-align:top">${esc(k)}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e6e1d7;color:#1c2b2c;font-size:15px;vertical-align:top">${nl2br(v)}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html><html><body style="margin:0;background:#faf8f4;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f4;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e6e1d7;border-radius:12px;overflow:hidden">
        <tr><td style="background:#0b3f3b;padding:18px 24px;color:#ffffff;font-size:16px;font-weight:bold">${esc(siteConfig.name)}</td></tr>
        <tr><td style="padding:24px 24px 8px">
          <h1 style="margin:0 0 8px;font-size:20px;color:#1c2b2c">${esc(heading)}</h1>
          ${intro ? `<p style="margin:0;color:#4a5a5c;font-size:15px;line-height:1.6">${esc(intro)}</p>` : ""}
        </td></tr>
        <tr><td style="padding:12px 10px 20px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
        </td></tr>
        <tr><td style="padding:16px 24px;background:#f2eee6;color:#5c6b6d;font-size:12px;line-height:1.6">
          ${footer ? `${esc(footer)}<br>` : ""}${esc(siteConfig.contact.phone)} · ${esc(siteConfig.address.full)}
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

const toText = (heading, rows) =>
  [heading, "", ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)].join("\n");

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
      html: layout({ heading: clinicHeading, rows, footer: "Call the patient to confirm." }),
      text: toText(clinicHeading, rows),
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
    html: layout({ heading, rows }),
    text: toText(heading, rows),
  };
}

export function orderEmail(o) {
  const rows = [
    ["Reference", o.reference],
    ["Medicine", o.productLabel],
    ["Quantity", o.quantity],
    ["Prescription required", o.rx ? "Yes" : "No"],
    ["Prescription file", o.fileName ?? "Not attached"],
    ["Patient", o.name],
    ["Mobile", o.phone],
    ["Address", o.address],
    ["Note", o.note],
  ];
  const heading = o.rx ? "New prescription order" : "New medicine order request";
  return {
    subject: `${o.rx ? "Rx order" : "Order"} · ${o.name} · ${o.productLabel} [${o.reference}]`,
    html: layout({ heading, rows, footer: "Verify the prescription and call the patient before dispatch." }),
    text: toText(heading, rows),
  };
}
