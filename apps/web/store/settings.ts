import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const TEXT_SIZES = ["Default", "Large", "Larger"] as const;

type SettingsState = {
  /** Index into TEXT_SIZES. Anything above Default turns on large text mode. */
  textSize: number;
  language: number;
  notifications: boolean[];
  offlineCleared: boolean;
  onboarded: boolean;
  set: (patch: Partial<Omit<SettingsState, "set">>) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      textSize: 0,
      language: 0,
      notifications: [true, true, false],
      offlineCleared: false,
      onboarded: false,
      set: (patch) => set(patch),
    }),
    { name: "visus.settings", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);
