/**
 * Lean Mongo doc → plain JSON shape the UI already expects.
 *  - `_id` → `id` (string), `__v` dropped
 *  - ObjectId → string, Date → ISO string (via JSON round-trip)
 * Required because RSC props and unstable_cache both need plain, serialisable data.
 */
export function toPlain(doc) {
  if (!doc) return null;
  const { _id, __v, ...rest } = JSON.parse(JSON.stringify(doc));
  return _id === undefined ? rest : { id: String(_id), ...rest };
}

export const toPlainList = (docs) => docs.map(toPlain);

/** Date → "YYYY-MM-DD" in Asia/Dhaka (blog dates are shown as calendar days). */
export function toDhakaDay(date) {
  if (!date) return null;
  return new Date(new Date(date).getTime() + 6 * 3600 * 1000).toISOString().slice(0, 10);
}

/** "YYYY-MM-DD" (Dhaka calendar day) → Date at 00:00 Asia/Dhaka. */
export const fromDhakaDay = (day) => new Date(`${day}T00:00:00+06:00`);
