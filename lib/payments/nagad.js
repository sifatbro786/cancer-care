import "server-only";
import crypto from "node:crypto";
import { nagadConfig } from "./config";
import { GatewayError, gatewayFetch } from "./errors";

/**
 * Nagad Online Payment API (check-out).
 *   initialize (RSA-encrypted challenge) → complete (amount) → redirect to callBackUrl
 *   → Nagad calls our merchantCallbackURL?payment_ref_id=&order_id=&status=
 *   → verify/payment/{payment_ref_id} (server-to-server — never trust the query string).
 *
 * Crypto: request `sensitiveData` = RSA/PKCS#1 v1.5 encrypt with Nagad's PG public key,
 * `signature` = SHA256withRSA with OUR merchant private key. Keys may be given as PEM or as the
 * bare base64 Nagad hands out (PKCS#8 or PKCS#1). Needs Node with OpenSSL ≥ 3.2 for PKCS#1
 * decryption (Node 24 bundles 3.5) — older builds need --security-revert=CVE-2023-46809.
 */

const pem = (raw, label) => {
  const v = raw.replace(/\\n/g, "\n").trim();
  if (v.includes("-----BEGIN")) return v;
  const body = v.replace(/\s+/g, "").match(/.{1,64}/g)?.join("\n") ?? "";
  return `-----BEGIN ${label}-----\n${body}\n-----END ${label}-----`;
};

function keys() {
  const c = nagadConfig();
  const src = `${c.pgPublicKey}|${c.merchantPrivateKey}`;
  if (globalThis.__ccNagadKeys?.src === src) return globalThis.__ccNagadKeys;
  let priv;
  try {
    priv = crypto.createPrivateKey(pem(c.merchantPrivateKey, "PRIVATE KEY"));
  } catch {
    priv = crypto.createPrivateKey(pem(c.merchantPrivateKey, "RSA PRIVATE KEY"));
  }
  const pub = crypto.createPublicKey(pem(c.pgPublicKey, "PUBLIC KEY"));
  return (globalThis.__ccNagadKeys = { src, pub, priv });
}

const PKCS1 = crypto.constants.RSA_PKCS1_PADDING;
const encrypt = (obj) => crypto.publicEncrypt({ key: keys().pub, padding: PKCS1 }, Buffer.from(JSON.stringify(obj))).toString("base64");
const sign = (obj) => crypto.sign("sha256", Buffer.from(JSON.stringify(obj)), keys().priv).toString("base64");
const decrypt = (b64) => crypto.privateDecrypt({ key: keys().priv, padding: PKCS1 }, Buffer.from(b64, "base64")).toString("utf8");
const verifySig = (text, b64) => {
  try {
    return crypto.verify("sha256", Buffer.from(text), keys().pub, Buffer.from(b64, "base64"));
  } catch {
    return false;
  }
};

/** Asia/Dhaka wall clock as YYYYMMDDHHmmss (no DST in Bangladesh). */
const dhakaStamp = () => new Date(Date.now() + 6 * 3600 * 1000).toISOString().replace(/\D/g, "").slice(0, 14);

const headers = (ip) => ({
  "X-KM-Api-Version": "v-0.2.0",
  "X-KM-IP-V4": /^\d{1,3}(\.\d{1,3}){3}$/.test(ip ?? "") ? ip : "127.0.0.1",
  "X-KM-Client-Type": "PC_WEB",
});

const message = (j) => j?.message || j?.reason || j?.status || "Unknown Nagad error";

/** @returns {{ gatewayRef: string, redirectUrl: string }} */
export async function createNagadPayment({ amount, orderId, callbackURL, ip }) {
  const c = nagadConfig();
  const datetime = dhakaStamp();
  const challenge = crypto.randomBytes(20).toString("hex");
  const sensitive = { merchantId: c.merchantId, datetime, orderId, challenge };

  const init = await gatewayFetch(`${c.baseUrl}/api/dfs/check-out/initialize/${c.merchantId}/${orderId}?locale=EN`, {
    headers: headers(ip),
    body: {
      ...(c.merchantNumber ? { accountNumber: c.merchantNumber } : {}),
      dateTime: datetime,
      sensitiveData: encrypt(sensitive),
      signature: sign(sensitive),
    },
    label: "Nagad initialize",
  });
  if (!init.sensitiveData) throw new GatewayError(`Nagad initialize: ${message(init)}`, init);

  let plain;
  try {
    const text = decrypt(init.sensitiveData);
    if (init.signature && !verifySig(text, init.signature)) console.warn("[nagad] initialize: PG signature did not verify");
    plain = JSON.parse(text);
  } catch (err) {
    throw new GatewayError(`Nagad initialize: could not read the response (${err.message}) — check NAGAD keys`);
  }
  if (!plain?.paymentReferenceId || !plain?.challenge) throw new GatewayError("Nagad initialize: missing paymentReferenceId", plain);

  const order = { merchantId: c.merchantId, orderId, currencyCode: "050", amount: String(amount), challenge: plain.challenge };
  const done = await gatewayFetch(`${c.baseUrl}/api/dfs/check-out/complete/${encodeURIComponent(plain.paymentReferenceId)}`, {
    headers: headers(ip),
    body: {
      sensitiveData: encrypt(order),
      signature: sign(order),
      merchantCallbackURL: callbackURL,
      additionalMerchantInfo: {},
    },
    label: "Nagad complete",
  });
  if (done.status !== "Success" || !done.callBackUrl) throw new GatewayError(`Nagad complete: ${message(done)}`, done);
  return { gatewayRef: plain.paymentReferenceId, redirectUrl: done.callBackUrl };
}

/** Server-to-server status check — the only thing we trust after the callback. */
export async function verifyNagadPayment(paymentRefId, ip) {
  const c = nagadConfig();
  const j = await gatewayFetch(`${c.baseUrl}/api/dfs/verify/payment/${encodeURIComponent(paymentRefId)}`, {
    method: "GET",
    headers: headers(ip),
    label: "Nagad verify",
  });
  return {
    completed: j.status === "Success",
    amount: Number(j.amount),
    trxId: j.issuerPaymentRefNo ?? null,
    orderId: j.orderId ?? null,
    payer: j.clientMobileNo ?? null,
    status: j.status ?? null,
    message: message(j),
  };
}
