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

/** Order fulfilment. Payment is tracked separately (order.payment) and never blocks a step:
 *  pay-later orders are paid on delivery. */
export const ORDER_FLOW = Object.freeze({
  new: ["processing", "cancelled"],
  processing: ["dispatched", "cancelled"],
  dispatched: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
});

export const MESSAGE_FLOW = Object.freeze({
  unread: ["read", "archived"],
  read: ["unread", "archived"],
  archived: ["read"],
});

export const canTransition = (flow, from, to) => Boolean(flow[from]?.includes(to));
