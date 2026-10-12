import "server-only";
import { bkashConfig } from "./config";
import { GatewayError, gatewayFetch } from "./errors";

/**
 * bKash Tokenized Checkout (v1.2.0-beta).
 *   grant token → create (customer is redirected to bkashURL)
 *   → bKash calls our callbackURL?paymentID=&status=success|failure|cancel
 *   → execute (captures the money) → query status as the fallback / double-check.
 * Docs: https://developer.bka.sh  (sandbox & live base URLs differ only by host)
 */

const OK = "0000";
const message = (j) => j?.statusMessage || j?.errorMessage || j?.message || j?.msg || "Unknown bKash error";

/** id_token is valid ~1 h; cached per server process and renewed a minute early. */
async function token() {
  const cached = globalThis.__ccBkashToken;
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const c = bkashConfig();
  const j = await gatewayFetch(`${c.baseUrl}/tokenized/checkout/token/grant`, {
    headers: { username: c.username, password: c.password },
    body: { app_key: c.appKey, app_secret: c.appSecret },
    label: "bKash token",
  });
  if (!j.id_token) throw new GatewayError(`bKash token: ${message(j)}`, j);
  globalThis.__ccBkashToken = { token: j.id_token, expiresAt: Date.now() + (Number(j.expires_in) || 3600) * 1000 };
  return j.id_token;
}

async function call(path, body, label) {
  const c = bkashConfig();
  return gatewayFetch(`${c.baseUrl}${path}`, {
    headers: { Authorization: await token(), "X-APP-Key": c.appKey },
    body,
    label,
  });
}

/** Normalised result shared with the Nagad adapter. */
const result = (j) => ({
  completed: j?.transactionStatus === "Completed",
  amount: Number(j?.amount),
  trxId: j?.trxID ?? null,
  invoice: j?.merchantInvoiceNumber ?? null,
  payer: j?.customerMsisdn ?? null,
  status: j?.transactionStatus ?? null,
  message: message(j),
});

/** @returns {{ gatewayRef: string, redirectUrl: string }} */
export async function createBkashPayment({ amount, invoice, payerReference, callbackURL }) {
  const j = await call(
    "/tokenized/checkout/create",
    {
      mode: "0011", // checkout URL flow
      payerReference, // pre-fills the wallet number on bKash's page
      callbackURL,
      amount: String(amount),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: invoice,
    },
    "bKash create"
  );
  if (j.statusCode !== OK || !j.paymentID || !j.bkashURL) throw new GatewayError(`bKash create: ${message(j)}`, j);
  return { gatewayRef: j.paymentID, redirectUrl: j.bkashURL };
}

export async function queryBkashPayment(paymentID) {
  return result(await call("/tokenized/checkout/payment/status", { paymentID }, "bKash query"));
}

/**
 * Capture the payment. If execute fails, times out or was already done (page refresh,
 * duplicate callback), the status query is the source of truth.
 */
export async function executeBkashPayment(paymentID) {
  try {
    const j = await call("/tokenized/checkout/execute", { paymentID }, "bKash execute");
    if (j.statusCode === OK && j.transactionStatus === "Completed") return result(j);
    console.warn(`[bkash] execute ${paymentID}: ${message(j)} — querying status`);
  } catch (err) {
    console.warn(`[bkash] execute ${paymentID} failed (${err.message}) — querying status`);
  }
  return queryBkashPayment(paymentID);
}
