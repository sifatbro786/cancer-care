/**
 * Inbox workflows — the single source of truth for which status changes are allowed.
 * Pure module: the UI uses it to decide which buttons to show, the server re-checks
 * every transition with it (plus an optimistic-concurrency guard on the current status).
 */

/** Appointment: the clinic calls the patient, then confirms. No per-slot limit (owner decision). */
export const APPOINTMENT_FLOW = Object.freeze({
  new: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  cancelled: ["new"], // "Reopen" — undo a mistaken cancel
  completed: [],
});

/** Order fulfilment. Prescription gate: see canAdvanceOrder(). */
export const ORDER_FLOW = Object.freeze({
  new: ["processing", "cancelled"],
  processing: ["dispatched", "cancelled"],
  dispatched: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
});

export const PRESCRIPTION_REVIEW = Object.freeze({
  pending: ["verified", "rejected"],
  verified: [],
  rejected: [],
  not_required: [],
});

export const MESSAGE_FLOW = Object.freeze({
  unread: ["read", "archived"],
  read: ["unread", "archived"],
  archived: ["read"],
});

export const canTransition = (flow, from, to) => Boolean(flow[from]?.includes(to));

/**
 * An order whose prescription is required may only leave "new" once a pharmacist has
 * verified it. Cancelling is always allowed.
 */
export function orderBlockedReason(order, to) {
  if (to === "cancelled") return null;
  const rx = order.prescription ?? {};
  if (rx.required && rx.status !== "verified") return "rxNotVerified";
  return null;
}
