import { useSyncExternalStore } from 'react';

import { useAuth } from '@/store/auth';
import { useCalibration } from '@/store/calibration';
import { useOffline } from '@/store/offline';
import { useSettings } from '@/store/settings';

const stores = [useAuth, useSettings, useCalibration, useOffline];

const subscribe = (onChange: () => void) => {
  const stops = stores.map((s) => s.persist.onFinishHydration(onChange));
  return () => stops.forEach((stop) => stop());
};
const hydrated = () => stores.every((s) => s.persist.hasHydrated());

/** True once the stores saved on the phone are loaded; the splash screen stays up until then. */
export const useHydrated = () => useSyncExternalStore(subscribe, hydrated);
