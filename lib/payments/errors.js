import "server-only";

/** Anything that went wrong talking to a payment gateway. `details` = raw response (logged, never shown). */
export class GatewayError extends Error {
  constructor(message, details) {
    super(message);
    this.name = "GatewayError";
    this.details = details;
  }
}

/** POST/GET JSON with a hard timeout. Gateways answer errors as JSON too, so non-JSON = real failure. */
export async function gatewayFetch(url, { method = "POST", headers = {}, body, timeoutMs = 30_000, label }) {
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Accept: "application/json", ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (err) {
    throw new GatewayError(`${label}: ${err?.name === "TimeoutError" ? "timed out" : err?.message ?? "network error"}`);
  }
  const json = await res.json().catch(() => null);
  if (!json || typeof json !== "object") throw new GatewayError(`${label}: HTTP ${res.status}, response was not JSON`);
  return json;
}
