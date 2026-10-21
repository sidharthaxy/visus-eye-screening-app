import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** ISO/IEC 7810 ID-1 bank card. */
export const CARD_MM = { w: 85.6, h: 53.98 };

/** ~96 dpi CSS pixels, used until the user calibrates. */
export const DEFAULT_PX_PER_MM = 3.78;

type CalibrationState = {
  pxPerMm: number;
  calibrated: boolean;
  setPxPerMm: (pxPerMm: number) => void;
};

export const useCalibration = create<CalibrationState>()(
  persist(
    (set) => ({
      pxPerMm: DEFAULT_PX_PER_MM,
      calibrated: false,
      setPxPerMm: (pxPerMm) => set({ pxPerMm, calibrated: true }),
    }),
    { name: "visus.calibration", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

/** Letter height in mm for a Snellen line (6/x) at a viewing distance: 5 arc-minutes at 6/6. */
export function snellenMm(denominator: number, distanceMm: number) {
  const arcMin = (5 * denominator) / 6;
  return 2 * distanceMm * Math.tan(((arcMin / 60) * Math.PI) / 360);
}
