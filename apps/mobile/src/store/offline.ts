import type { SubmitResult, TestId } from '@visus/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { phoneStorage } from '@/store/storage';

/** A single test taken offline: raw answers wait on the phone until they can be sent and scored. */
export type PendingTest = { id: string; profileId: string; testId: TestId; result: SubmitResult; takenAt: string };

type OfflineState = {
  pending: PendingTest[];
  add: (item: PendingTest) => void;
  remove: (id: string) => void;
};

export const useOffline = create<OfflineState>()(
  persist(
    (set) => ({
      pending: [],
      add: (item) => set(({ pending }) => ({ pending: [...pending, item] })),
      remove: (id) => set(({ pending }) => ({ pending: pending.filter((p) => p.id !== id) })),
    }),
    { name: 'visus-offline', storage: phoneStorage, partialize: ({ pending }) => ({ pending }) },
  ),
);

/** Local session ids for checks started offline. */
export const OFFLINE_PREFIX = 'offline-';
