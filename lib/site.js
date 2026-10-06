/**
 * Site settings helpers (pure — safe on server and client).
 * The editable part of the site config (contact, address, hours, socials, footer copy)
 * lives in SiteSettings (Admin → Site settings). Navigation, CTAs, brand name and URL
 * stay in code (data/siteConfig.js) — they are structure, not content.
 */

/** "+880 1540-129969" / "01540129969" → "tel:+8801540129969" */
export function telHref(phone) {
  const d = String(phone ?? "").replace(/\D/g, "");
  if (!d) return "";
  const intl = d.startsWith("880") ? d : d.startsWith("0") ? `88${d}` : d;
  return `tel:+${intl}`;
}

/** WhatsApp deep link with the prefilled greeting. `contact.whatsapp` = digits only (8801…). */
export const whatsappLink = (contact) =>
  `https://wa.me/${contact.whatsapp}${contact.whatsappMessage ? `?text=${encodeURIComponent(contact.whatsappMessage)}` : ""}`;

const filled = (v) => v !== undefined && v !== null && v !== "";

/** Overlay non-empty values of `patch` onto `base` (one level). */
function overlay(base, patch) {
  if (!patch) return base;
  const out = { ...base };
  for (const [k, v] of Object.entries(patch)) if (filled(v)) out[k] = v;
  return out;
}

/**
 * Static config + DB settings → the config every component reads.
 * Empty DB values never blank out a working default.
 */
export function mergeSite(base, s) {
  if (!s) return base;
  const contact = overlay(base.contact, s.contact);
  // hrefs are always derived from the editable values, never trusted as stored
  contact.phoneHref = telHref(contact.phone) || base.contact.phoneHref;
  contact.emailHref = contact.email ? `mailto:${contact.email}` : base.contact.emailHref;

  const address = overlay(base.address, { ...s.address, geo: undefined });
  const lat = s.address?.geo?.lat;
  const lng = s.address?.geo?.lng;
  if (typeof lat === "number" && typeof lng === "number") address.geo = { lat, lng };

  return {
    ...base,
    contact,
    address,
    hours: s.hours?.length ? s.hours : base.hours,
    emergencyNote: s.emergencyNote || base.emergencyNote,
    social: s.social?.length ? s.social : base.social,
    footer: { ...base.footer, ...overlay({}, { about: s.footer?.about, disclaimer: s.footer?.disclaimer }) },
  };
}
