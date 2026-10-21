import type { TestId } from '@visus/shared';
import type { ComponentType } from 'react';

import { Amsler } from '@/tests/Amsler';
import { ClockDial } from '@/tests/ClockDial';
import { ColourPlates } from '@/tests/ColourPlates';
import { Contrast } from '@/tests/Contrast';
import { Duochrome } from '@/tests/Duochrome';
import { KidsColourShapes } from '@/tests/KidsColourShapes';
import { KidsTumblingE } from '@/tests/KidsTumblingE';
import { NearPoint } from '@/tests/NearPoint';
import { NearReading } from '@/tests/NearReading';
import type { TestProps } from '@/tests/parts';
import { Peripheral } from '@/tests/Peripheral';
import { EYE_STRAIN, GLARE_NIGHT, Questionnaire, RISK_SCREENER } from '@/tests/Questionnaire';
import { TumblingE } from '@/tests/TumblingE';

const RiskScreener = (props: TestProps) => <Questionnaire {...props} config={RISK_SCREENER} />;
const EyeStrain = (props: TestProps) => <Questionnaire {...props} config={EYE_STRAIN} />;
const GlareNight = (props: TestProps) => <Questionnaire {...props} config={GLARE_NIGHT} />;

/** One screen per test, keyed by TestId. */
export const TESTS: Record<TestId, ComponentType<TestProps>> = {
  tumbling_e: TumblingE,
  near_reading: NearReading,
  near_point: NearPoint,
  clock_dial: ClockDial,
  duochrome: Duochrome,
  amsler: Amsler,
  contrast: Contrast,
  peripheral_field: Peripheral,
  colour_plates: ColourPlates,
  risk_screener: RiskScreener,
  eye_strain: EyeStrain,
  glare_night: GlareNight,
  kids_tumbling_e: KidsTumblingE,
  kids_colour_shapes: KidsColourShapes,
};

/** Tests drawn on a plain white page instead of the pearl background. */
export const WHITE_PAGE: TestId[] = ['peripheral_field'];
