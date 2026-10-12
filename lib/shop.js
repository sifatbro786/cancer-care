/**
 * Shop rules shared by server and client (pure — no server imports).
 * Expiry is a calendar day "YYYY-MM-DD" (Asia/Dhaka); a medicine is sellable up to and
 * including that day. ISO day strings compare correctly as plain strings.
 */

export const dhakaToday = () => new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 10);

export const isExpired = (product, today = dhakaToday()) =>
  Boolean(product?.expiryDate) && product.expiryDate < today;

/** Can this medicine be ordered right now? (active is already filtered by the content layer) */
export const canOrder = (product, today = dhakaToday()) => Boolean(product?.inStock) && !isExpired(product, today);
