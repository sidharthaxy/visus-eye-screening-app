import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { TextSizes } from '@/constants/theme';
import { phoneStorage } from '@/store/storage';

export type TextSize = keyof typeof TextSizes;
export type Reminder = 'check' | 'breaks' | 'weekly';

type SettingsState = {
  textSize: TextSize;
  reminders: Record<Reminder, boolean>;
  /** Re-check reminder (56) "Remind me in a week": the Home banner stays hidden until then (ISO). */
  recheckSnoozedUntil: string | null;
  setTextSize: (size: TextSize) => void;
  snoozeRecheck: (until: string) => void;
  setReminder: (key: Reminder, on: boolean) => void;
};

/** Settings (24), kept on the phone. */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      textSize: 'normal',
      // The check reminder needs notification permission, so it starts off.
      reminders: { check: false, breaks: true, weekly: false },
      recheckSnoozedUntil: null,
      setTextSize: (textSize) => set({ textSize }),
      snoozeRecheck: (until) => set({ recheckSnoozedUntil: until }),
      setReminder: (key, on) => set(({ reminders }) => ({ reminders: { ...reminders, [key]: on } })),
    }),
    {
      name: 'visus-settings',
      storage: phoneStorage,
      partialize: ({ textSize, reminders, recheckSnoozedUntil }) => ({ textSize, reminders, recheckSnoozedUntil }),
    },
  ),
);

/** How much bigger text is than the design: 1, 1.12 (large) or 1.25 (larger). */
export const useTextScale = () => useSettings((s) => TextSizes[s.textSize].scale);

/** Button, option and chip heights for the chosen text size. */
export const useSizes = () => useSettings((s) => TextSizes[s.textSize]);
