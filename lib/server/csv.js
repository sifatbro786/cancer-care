import "server-only";

/**
 * Minimal RFC 4180 CSV writer.
 * - Every field quoted; quotes doubled; CRLF line endings (Excel-friendly).
 * - CSV/formula injection guard: a text cell starting with = + - @ TAB or CR is prefixed
 *   with an apostrophe, so Excel/Sheets show it as text instead of running it
 *   (patients type free text into the forms — it must never become a formula).
 * - UTF-8 BOM so Excel opens Bangla names correctly.
 */
const FORMULA = /^[=+\-@\t\r]/;

function cell(v) {
  if (v === null || v === undefined) return '""';
  let s = typeof v === "number" ? String(v) : String(v);
  if (typeof v === "string" && FORMULA.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(header, rows) {
  const lines = [header.map(cell).join(","), ...rows.map((r) => r.map(cell).join(","))];
  return `﻿${lines.join("\r\n")}\r\n`;
}
