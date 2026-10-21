import { TEST_CATALOG, type CreateSessionResponse, type NextStep, type ScoredResult, type TestId, type Verdict } from '@visus/shared';
import type { Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { create } from 'zustand';

import { getMyProfile } from '@/services/profiles';
import { createSession, getSession } from '@/services/sessions';
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

/** Starts a one-test check (mode "single") and returns where to go first. */
export async function startSingleTest(testId: TestId): Promise<Href> {
  const profile = await getMyProfile();
  const session = await createSession({ profileId: profile.id, intake: '', mode: 'single', testId });
  useCheck.getState().start('single', session);
  return firstStep();
}

/**
 * The verdict of a check: from the store right after the check, otherwise from
 * GET /sessions/:id (a past check opened from the Results tab).
 */
export function useVerdict(sessionId: string) {
  const current = useCheck((s) => (s.verdict?.sessionId === sessionId ? s.verdict : null));
  const [loaded, setLoaded] = useState<Verdict | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (current) return;
    let live = true;
    getSession(sessionId)
      .then((v) => live && setLoaded(v))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [current, sessionId, attempt]);

  return {
    verdict: current ?? (loaded?.sessionId === sessionId ? loaded : null),
    failed,
    retry: () => {
      setFailed(false);
      setAttempt((a) => a + 1);
    },
  };
}
