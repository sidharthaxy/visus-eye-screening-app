import type { NextStep, ScoredResult, TestId, Verdict } from "@visus/shared";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CheckMode, CreatedSession } from "@/services/sessions";

type CheckState = {
  sessionId: string | null;
  mode: CheckMode;
  profileId: string | null;
  intake: string;
  summary: string;
  plan: { testId: TestId; reason: string }[];
  done: TestId[];
  results: ScoredResult[];
  lastStep: NextStep | null;
  verdict: Verdict | null;
  startedAt: number;

  setProfile: (profileId: string) => void;
  start: (session: CreatedSession, mode: CheckMode, intake: string) => void;
  recordStep: (step: NextStep) => void;
  setVerdict: (verdict: Verdict) => void;
  reset: () => void;
};

const empty = {
  sessionId: null,
  mode: "full" as CheckMode,
  intake: "",
  summary: "",
  plan: [],
  done: [],
  results: [],
  lastStep: null,
  verdict: null,
  startedAt: 0,
};

/** The check in progress. Kept in sessionStorage so a refresh mid-check doesn't lose it. */
export const useCheck = create<CheckState>()(
  persist(
    (set) => ({
      ...empty,
      profileId: null,
      setProfile: (profileId) => set({ profileId }),
      start: (session, mode, intake) =>
        set({ ...empty, sessionId: session.sessionId, summary: session.summary, plan: session.plan, mode, intake, startedAt: Date.now() }),
      recordStep: (step) =>
        set((s) => {
          const plan =
            step.type === "next_test" && !s.plan.some((p) => p.testId === step.testId)
              ? [...s.plan, { testId: step.testId, reason: step.reason }]
              : s.plan;
          return {
            plan,
            lastStep: step,
            done: [...s.done.filter((id) => id !== step.result.testId), step.result.testId],
            results: [...s.results.filter((r) => r.testId !== step.result.testId), step.result],
          };
        }),
      setVerdict: (verdict) => set({ verdict }),
      reset: () => set(empty),
    }),
    { name: "visus.check", storage: createJSONStorage(() => sessionStorage), skipHydration: true },
  ),
);

/** First test in the plan that hasn't been done yet. */
export function nextPlannedTest(s: Pick<CheckState, "plan" | "done">): TestId | null {
  return s.plan.find((p) => !s.done.includes(p.testId))?.testId ?? null;
}
