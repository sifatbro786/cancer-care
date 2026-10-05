import { media } from "@/data/media";

/**
 * Site image slots.
 * ─────────────────────────────────────────────────────────────────
 * Every named image in data/media.js ("hero", "doctorPortrait", …) is a slot whose
 * DEFAULT is its Unsplash placeholder. An admin can point a slot at an uploaded image
 * (SiteSettings.imageOverrides); "reset" removes the override → Unsplash again.
 *
 * Content files embed the default image objects ({ src, alt }) — homeData, aboutData,
 * doctor.photo, service.image… `applySlots()` swaps any object whose `src` is a slot
 * default for the override, so no data file or component needs restructuring.
 * ─────────────────────────────────────────────────────────────────
 */

export const SLOT_KEYS = Object.freeze(Object.keys(media));

export const slotDefaults = () =>
  Object.fromEntries(SLOT_KEYS.map((k) => [k, { src: media[k].src, alt: media[k].alt, custom: false }]));

const keyByDefaultSrc = new Map(SLOT_KEYS.map((k) => [media[k].src, k]));

const isPlainObject = (v) => v !== null && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype;

/**
 * Deep copy-on-write: returns `value` untouched when nothing is overridden.
 * @param slots  { [key]: { src, alt, custom } } from getImageSlots()
 */
export function applySlots(value, slots) {
  if (!slots || !Object.values(slots).some((s) => s.custom)) return value;

  const walk = (v) => {
    if (Array.isArray(v)) {
      let changed = false;
      const out = v.map((x) => {
        const y = walk(x);
        if (y !== x) changed = true;
        return y;
      });
      return changed ? out : v;
    }
    if (!isPlainObject(v)) return v;

    if (typeof v.src === "string" && keyByDefaultSrc.has(v.src)) {
      const slot = slots[keyByDefaultSrc.get(v.src)];
      // keep extra props (e.g. `caption`); uploaded alt wins, else the default alt
      if (slot?.custom) return { ...v, src: slot.src, alt: slot.alt || v.alt };
      return v;
    }

    let changed = false;
    const out = {};
    for (const [k, x] of Object.entries(v)) {
      const y = walk(x);
      if (y !== x) changed = true;
      out[k] = y;
    }
    return changed ? out : v;
  };

  return walk(value);
}
