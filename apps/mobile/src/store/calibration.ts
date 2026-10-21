import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { phoneStorage } from '@/store/storage';

/** ISO/IEC 7810 ID-1 card (any bank card): 85.60 × 53.98 mm. */
export const CARD_MM = { long: 85.6, short: 53.98 };

type CalibrationState = {
  /** Screen points per millimetre. null until the user has matched a card. */
  pxPerMm: number | null;
  /** Card outline width (points) the user last set, to restore the slider. */
  cardWidth: number | null;
  setCardWidth: (width: number) => void;
  /** Settings → Offline data → Clear: calibration is asked again before the next test. */
  clear: () => void;
};

/** Kept on the phone: the screen size doesn't change, so calibration is asked once. */
export const useCalibration = create<CalibrationState>()(
  persist(
    (set) => ({
      pxPerMm: null,
      cardWidth: null,
      // The card is shown upright, so its width on screen is the 53.98 mm short edge.
      setCardWidth: (width) => set({ cardWidth: width, pxPerMm: width / CARD_MM.short }),
      clear: () => set({ pxPerMm: null, cardWidth: null }),
    }),
    {
      name: 'visus-calibration',
      storage: phoneStorage,
      partialize: ({ pxPerMm, cardWidth }) => ({ pxPerMm, cardWidth }),
    },
  ),
);
