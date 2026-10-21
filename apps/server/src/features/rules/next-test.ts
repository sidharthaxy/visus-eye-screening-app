// Simple rules for the next test (e.g. soft vision in one eye → add clock dial).
// Returns a test to add, null when nothing needs adding, or "undecided" when the agent should re-plan.
import { TEST_CATALOG, type ScoredResult, type TestId } from '@visus/shared';

export type Added = { testId: TestId; reason: string };
export type RuleDecision = Added | null | 'undecided';

/** Tests already in the plan or done can't be added again. */
export function canAdd(testId: TestId, taken: TestId[], age: number) {
  const info = TEST_CATALOG.find((t) => t.id === testId);
  return !!info && !taken.includes(testId) && age >= info.minAge && info.category !== 'kids';
}

export function nextTestRule(result: ScoredResult, taken: TestId[], age: number): RuleDecision {
  if (result.status === 'good') return null;
  const add = (testId: TestId, reason: string): Added | null => (canAdd(testId, taken, age) ? { testId, reason } : null);
  switch (result.testId) {
    case 'tumbling_e':
      return add('clock_dial', 'Blur can come from astigmatism') ?? add('duochrome', 'Checks if your focus is a little off');
    case 'near_reading':
      return add('near_point', 'How close your eyes can focus');
    case 'contrast':
      return add('glare_night', 'Low contrast often shows up as glare at night');
    case 'amsler':
    case 'peripheral_field':
      return add('risk_screener', 'Health and family risk factors');
    case 'eye_strain':
      return null;
    default:
      return 'undecided';
  }
}
