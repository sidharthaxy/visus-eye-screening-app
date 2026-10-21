// scoreTest(testId, eye, answers, ctx) → ScoredResult, picks the scorer for each test.
// Answer shapes per test are in docs/API.md. Scorers accept both the mobile and the web shapes.
import type { Eye, ScoredResult, TestId } from '@visus/shared';

import { scoreKidsTumblingE, scoreTumblingE } from './acuity';
import { scoreAmsler } from './amsler';
import { scoreClockDial } from './clock-dial';
import { scoreColourPlates, scoreKidsColourShapes } from './colour';
import { scoreContrast } from './contrast';
import { scoreDuochrome } from './duochrome';
import type { Answers, Ctx, Scored } from './helpers';
import { scoreNearPoint, scoreNearReading } from './near';
import { scorePeripheral } from './peripheral';
import { scoreEyeStrain, scoreGlareNight, scoreRiskScreener } from './questionnaires';

export type { Ctx } from './helpers';

const SCORERS: Record<TestId, (answers: Answers, eye: Eye, ctx: Ctx) => Scored> = {
  tumbling_e: scoreTumblingE,
  kids_tumbling_e: (a, eye) => scoreKidsTumblingE(a, eye),
  near_reading: (a, _eye, ctx) => scoreNearReading(a, ctx),
  near_point: scoreNearPoint,
  clock_dial: (a, eye) => scoreClockDial(a, eye),
  duochrome: (a, eye) => scoreDuochrome(a, eye),
  amsler: (a, eye) => scoreAmsler(a, eye),
  contrast: (a) => scoreContrast(a),
  peripheral_field: (a, eye) => scorePeripheral(a, eye),
  colour_plates: (a) => scoreColourPlates(a),
  kids_colour_shapes: (a) => scoreKidsColourShapes(a),
  risk_screener: (a) => scoreRiskScreener(a),
  eye_strain: (a) => scoreEyeStrain(a),
  glare_night: (a) => scoreGlareNight(a),
};

export function scoreTest(testId: TestId, eye: Eye, answers: Answers, ctx: Ctx = {}): ScoredResult {
  return { testId, eye, ...SCORERS[testId](answers, eye, ctx) };
}
