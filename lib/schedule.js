import { appointmentData } from "@/data/appointmentData";

/**
 * Scheduling helpers — isomorphic (used by the slot picker AND the API).
 * Bangladesh has no DST, so "Dhaka time" is a fixed UTC+6 offset; we shift
 * the timestamp and read UTC getters. This avoids server/client TZ drift.
 */
const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;
const { schedule } = appointmentData;

const pad = (n) => String(n).padStart(2, "0");

export function dhakaNow(now = Date.now()) {
  return new Date(now + DHAKA_OFFSET_MS);
}

/** "YYYY-MM-DD" for a shifted Date (read with UTC getters). */
function isoOf(d) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Next N days starting today (Dhaka), flagged closed/open for the given type. */
export function getBookableDays(type, now = Date.now()) {
  const start = dhakaNow(now);
  const closed = schedule.closedWeekdays[type] ?? [];
  return Array.from({ length: schedule.daysAhead }, (_, i) => {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i));
    return {
      iso: isoOf(d),
      weekday: d.getUTCDay(),
      day: d.getUTCDate(),
      month: d.getUTCMonth(),
      isToday: i === 0,
      closed: closed.includes(d.getUTCDay()),
    };
  });
}

/** Slots for a type on a given day; past slots today (+30 min buffer) are removed. */
export function getSlots(type, iso, now = Date.now()) {
  const all = schedule.slots[type] ?? [];
  const today = isoOf(dhakaNow(now));
  if (iso !== today) return all;
  const n = dhakaNow(now);
  const minutesNow = n.getUTCHours() * 60 + n.getUTCMinutes() + 30;
  return all.filter((s) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m >= minutesNow;
  });
}

/** Server-side guard: is this (type, day, slot) combination actually bookable? */
export function isBookable(type, iso, slot, now = Date.now()) {
  const day = getBookableDays(type, now).find((d) => d.iso === iso);
  if (!day || day.closed) return false;
  return getSlots(type, iso, now).includes(slot);
}

/** "17:30" → "5:30 PM" */
export function formatSlot(slot) {
  const [h, m] = slot.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${pad(m)} ${suffix}`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const weekdayShort = (w) => WEEKDAYS[w];
export const monthShort = (m) => MONTHS[m];

/** "2026-10-06" → "Tue, 6 Oct 2026" */
export function formatIsoDay(iso) {
  const [y, mo, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return `${WEEKDAYS[dt.getUTCDay()]}, ${d} ${MONTHS[mo - 1]} ${y}`;
}
