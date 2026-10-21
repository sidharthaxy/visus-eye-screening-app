import type { TestId } from "@visus/shared";
import type { ComponentType } from "react";

import { Amsler } from "./Amsler";
import { ClockDial } from "./ClockDial";
import { Contrast } from "./Contrast";
import { TumblingE } from "./TumblingE";
import type { TestProps } from "./types";

/** One component per test, keyed by TestId. */
export const TESTS: Partial<Record<TestId, ComponentType<TestProps>>> = {
  tumbling_e: TumblingE,
  clock_dial: ClockDial,
  amsler: Amsler,
  contrast: Contrast,
};
