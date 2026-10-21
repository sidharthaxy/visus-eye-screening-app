import { create } from 'zustand';

/** ISO/IEC 7810 ID-1 card (any bank card): 85.60 × 53.98 mm. */
export const CARD_MM = { long: 85.6, short: 53.98 };

type CalibrationState = {
  /** Screen points per millimetre. null until the user has matched a card. */
  pxPerMm: number | null;
  /** Card outline width (points) the user last set, to restore the slider. */
  cardWidth: number | null;
  setCardWidth: (width: number) => void;
};

/** Kept in memory: calibration is asked again after an app restart. */
export const useCalibration = create<CalibrationState>((set) => ({
  pxPerMm: null,
  cardWidth: null,
  // The card is shown upright, so its width on screen is the 53.98 mm short edge.
  setCardWidth: (width) => set({ cardWidth: width, pxPerMm: width / CARD_MM.short }),
}));
