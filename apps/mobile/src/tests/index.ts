import type { TestId } from '@visus/shared';
import type { ComponentType } from 'react';

import { Amsler } from '@/tests/Amsler';
import { ClockDial } from '@/tests/ClockDial';
import { Contrast } from '@/tests/Contrast';
import type { TestProps } from '@/tests/parts';
import { TumblingE } from '@/tests/TumblingE';

/** Test screens built so far, keyed by TestId. */
export const TESTS: Partial<Record<TestId, ComponentType<TestProps>>> = {
  tumbling_e: TumblingE,
  clock_dial: ClockDial,
  amsler: Amsler,
  contrast: Contrast,
};
