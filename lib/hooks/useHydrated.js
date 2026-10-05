"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false during SSR *and* the hydration render, true afterwards.
 * Use it to render time-/browser-dependent UI only on the client
 * (e.g. "today's" slots) without hydration mismatches — and without
 * the setState-in-useEffect pattern.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
