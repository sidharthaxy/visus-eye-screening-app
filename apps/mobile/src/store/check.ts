import { TEST_CATALOG, type CreateSessionResponse } from '@visus/shared';
import type { Href } from 'expo-router';
import { create } from 'zustand';

import { useCalibration } from '@/store/calibration';

export type CheckPlan = ReturnType<typeof CreateSessionResponse.parse>;
export type PlanItem = CheckPlan['plan'][number];
export type CheckMode = 'full' | 'quick' | 'single' | 'glasses';

type CheckState = {
  sessionId: string | null;
  mode: CheckMode;
  summary: string;
  plan: PlanItem[];
  /** Index in `plan` of the test being taken. */
  index: number;
  start: (mode: CheckMode, session: CheckPlan) => void;
  reset: () => void;
};

const empty = { sessionId: null, mode: 'full' as CheckMode, summary: '', plan: [], index: 0 };

/** The check in progress. Results, next step and verdict are added with the test run. */
export const useCheck = create<CheckState>((set) => ({
  ...empty,
  start: (mode, session) =>
    set({ sessionId: session.sessionId, mode, summary: session.summary, plan: session.plan, index: 0 }),
  reset: () => set(empty),
}));

/** Where to go when the plan starts: calibration first if a test needs it and the screen isn't calibrated. */
export function firstStep(): Href {
  const { plan, index } = useCheck.getState();
  const needsCalibration = plan.some((p) => TEST_CATALOG.find((t) => t.id === p.testId)?.needsCalibration);
  if (needsCalibration && useCalibration.getState().pxPerMm === null) return '/check/calibrate';
  return { pathname: '/check/[testId]/instructions', params: { testId: plan[index].testId } };
}
