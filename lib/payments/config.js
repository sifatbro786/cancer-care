import "server-only";
import { siteConfig } from "@/data/siteConfig";
import { isDbConfigured } from "@/lib/db/connect";
import { ONLINE_METHODS, PAYMENT_METHODS } from "@/lib/validation/order";

/**
 * Payment gateway configuration — everything comes from env (see .env.example).
 * A gateway is switched on simply by filling in its keys: no code change, no flag.
 * Online methods also need the database (the order + gateway session must be stored
 * before the customer is sent to bKash / Nagad). "offline" is always available.
 */

const env = (k) => (process.env[k] ?? "").trim();
const trimSlash = (u) => u.replace(/\/+$/, "");

export const BKASH_SANDBOX_URL = "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
export const NAGAD_SANDBOX_URL = "http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0";

export function bkashConfig() {
  return {
    baseUrl: trimSlash(env("BKASH_BASE_URL") || BKASH_SANDBOX_URL),
    appKey: env("BKASH_APP_KEY"),
    appSecret: env("BKASH_APP_SECRET"),
    username: env("BKASH_USERNAME"),
    password: env("BKASH_PASSWORD"),
  };
}

export function nagadConfig() {
  return {
    baseUrl: trimSlash(env("NAGAD_BASE_URL") || NAGAD_SANDBOX_URL),
    merchantId: env("NAGAD_MERCHANT_ID"),
    merchantNumber: env("NAGAD_MERCHANT_NUMBER"),
    pgPublicKey: env("NAGAD_PG_PUBLIC_KEY"),
    merchantPrivateKey: env("NAGAD_MERCHANT_PRIVATE_KEY"),
  };
}

const READY = {
  bkash: () => {
    const c = bkashConfig();
    return Boolean(c.appKey && c.appSecret && c.username && c.password);
  },
  nagad: () => {
    const c = nagadConfig();
    return Boolean(c.merchantId && c.pgPublicKey && c.merchantPrivateKey);
  },
};

export const isOnlineMethod = (m) => ONLINE_METHODS.includes(m);

/** Is this method usable right now on this server? */
export function isMethodEnabled(method) {
  if (method === "offline") return true;
  if (!isOnlineMethod(method)) return false;
  return isDbConfigured() && READY[method]();
}

/** Methods the order form should offer, in display order. */
export function enabledPaymentMethods() {
  return PAYMENT_METHODS.filter(isMethodEnabled);
}

/** Absolute URL on our own site (gateway callbacks, redirects after payment). */
export const siteUrl = (path) => `${trimSlash(siteConfig.url)}${path}`;
