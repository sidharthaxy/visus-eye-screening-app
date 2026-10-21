import { TEST_CATALOG, type CreateSessionResponse, type NextStep, type ScoredResult, type Verdict } from '@visus/shared';
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
  /** Scored results so far, as returned by the server. */
  results: ScoredResult[];
  /** The server's reply to the last test. */
  step: NextStep | null;
  /** Overall results, once the check is done. */
  verdict: Verdict | null;
  start: (mode: CheckMode, session: CheckPlan) => void;
  /** Saves the server's reply. On "next_test" it moves to that test, adding it to the plan if the agent added it. */
  record: (step: NextStep) => void;
  /** Moves to the next test in the plan (after a red flag). Returns false when there is none. */
  advance: () => boolean;
  setVerdict: (verdict: Verdict) => void;
  reset: () => void;
};

const empty = {
  sessionId: null,
  mode: 'full' as CheckMode,
  summary: '',
  plan: [],
  index: 0,
  results: [],
  step: null,
  verdict: null,
};

/** The check in progress, from the plan to the verdict. */
export const useCheck = create<CheckState>((set, get) => ({
  ...empty,
  start: (mode, session) =>
    set({ ...empty, sessionId: session.sessionId, mode, summary: session.summary, plan: session.plan }),
  record: (step) =>
    set(({ plan, index, results }) => {
      const next = { step, results: [...results, step.result] };
      if (step.type !== 'next_test') return next;
      const newPlan =
        plan[index + 1]?.testId === step.testId
          ? plan
          : [...plan.slice(0, index + 1), { testId: step.testId, reason: step.reason }, ...plan.slice(index + 1)];
      return { ...next, plan: newPlan, index: index + 1 };
    }),
  advance: () => {
    const { plan, index } = get();
    if (index + 1 >= plan.length) return false;
    set({ index: index + 1 });
    return true;
  },
  setVerdict: (verdict) => set({ verdict }),
  reset: () => set(empty),
}));

/** Where to go for the current test: calibration first if a test needs it and the screen isn't calibrated. */
export function firstStep(): Href {
  const { plan, index } = useCheck.getState();
  const needsCalibration = plan.some((p) => TEST_CATALOG.find((t) => t.id === p.testId)?.needsCalibration);
  if (needsCalibration && useCalibration.getState().pxPerMm === null) return '/check/calibrate';
  return { pathname: '/check/[testId]/instructions', params: { testId: plan[index].testId } };
}
