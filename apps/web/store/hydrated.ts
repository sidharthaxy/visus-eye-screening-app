import { create } from "zustand";

/** True once the persisted stores have loaded on the client. */
export const useHydrated = create<boolean>(() => false);
