import type { TestId } from "@visus/shared";
import type { ComponentType } from "react";

import { Amsler } from "./Amsler";
import { ClockDial } from "./ClockDial";
import { ColourPlates } from "./ColourPlates";
import { Contrast } from "./Contrast";
import { Duochrome } from "./Duochrome";
import { KidsColourShapes, KidsTumblingE } from "./Kids";
import { NearPoint } from "./NearPoint";
import { NearReading } from "./NearReading";
import { Peripheral } from "./Peripheral";
import { EyeStrain, GlareNight, RiskScreener } from "./Quiz";
import { TumblingE } from "./TumblingE";
import type { TestProps } from "./types";

/** One component per test, keyed by TestId. */
export const TESTS: Record<TestId, ComponentType<TestProps>> = {
  tumbling_e: TumblingE,
  near_reading: NearReading,
  near_point: NearPoint,
  clock_dial: ClockDial,
  duochrome: Duochrome,
  amsler: Amsler,
  contrast: Contrast,
  colour_plates: ColourPlates,
  kids_tumbling_e: KidsTumblingE,
  kids_colour_shapes: KidsColourShapes,
  risk_screener: RiskScreener,
  eye_strain: EyeStrain,
  glare_night: GlareNight,
  peripheral_field: Peripheral,
};
