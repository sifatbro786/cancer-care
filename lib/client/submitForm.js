import { formMessages as M } from "@/data/formMessages";

/**
 * POST helper for our Route Handlers.
 * Accepts a plain object (sent as JSON) or FormData (multipart).
 * Always resolves to { ok, message?, fieldErrors?, data? } — never throws.
 */
export async function submitForm(url, payload, { signal } = {}) {
  const isForm = typeof FormData !== "undefined" && payload instanceof FormData;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: isForm ? undefined : { "Content-Type": "application/json" },
      body: isForm ? payload : JSON.stringify(payload),
      signal,
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok) return { ok: true, data: json };
    return {
      ok: false,
      message: json.message ?? M.server.failed,
      fieldErrors: json.fieldErrors ?? {},
    };
  } catch (err) {
    if (err?.name === "AbortError") return { ok: false, aborted: true };
    return { ok: false, message: M.server.network, fieldErrors: {} };
  }
}

/** Push server field errors into react-hook-form. */
export function applyFieldErrors(setError, fieldErrors = {}) {
  let first = true;
  for (const [name, messages] of Object.entries(fieldErrors)) {
    if (!messages?.length) continue;
    setError(name, { type: "server", message: messages[0] }, { shouldFocus: first });
    first = false;
  }
}
