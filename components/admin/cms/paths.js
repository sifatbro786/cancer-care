/**
 * Immutable dot-path helpers for editor state ("contact.phone", "hours.0.label").
 * Numeric segments index arrays; missing branches are created as objects.
 */
export function getAt(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function setAt(obj, path, value) {
  const [head, ...rest] = path.split(".");
  const base = obj ?? {};
  const next = rest.length ? setAt(base[head], rest.join("."), value) : value;
  if (Array.isArray(base)) {
    const copy = base.slice();
    copy[Number(head)] = next;
    return copy;
  }
  return { ...base, [head]: next };
}

/** Error for a field: exact key first, else the first nested one (e.g. "degrees.2", "photo.src"). */
export function errorFor(errors, name) {
  if (errors[name]) return errors[name];
  const prefix = `${name}.`;
  const key = Object.keys(errors).find((k) => k.startsWith(prefix));
  return key ? errors[key] : undefined;
}

/** Move an array item one step; returns the same array when the move is out of range. */
export function moveItem(list, index, dir) {
  const j = index + dir;
  if (j < 0 || j >= list.length) return list;
  const copy = list.slice();
  [copy[index], copy[j]] = [copy[j], copy[index]];
  return copy;
}
