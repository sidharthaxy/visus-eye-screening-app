import { useSyncExternalStore } from "react";
import { create } from "zustand";

/** True once the persisted stores have loaded on the client. */
const useLoaded = create<boolean>(() => false);
export const markHydrated = () => useLoaded.setState(true, true);

const noop = () => () => {};

/**
 * True once persisted stores are loaded AND this component is past hydration, so server
 * HTML (store defaults) never mismatches the first client render.
 */
export function useHydrated() {
  const client = useSyncExternalStore(noop, () => true, () => false);
  return useLoaded() && client;
}
