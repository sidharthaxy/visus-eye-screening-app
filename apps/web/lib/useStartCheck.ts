"use client";

import type { TestId } from "@visus/shared";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { createSession, type CheckMode } from "@/services/sessions";
import { useCalibration } from "@/store/calibration";
import { useCheck } from "@/store/check";

import { testInfo } from "./tests";

/** Creates a session on the server, stores the plan and opens the first screen of the check. */
export function useStartCheck() {
  const router = useRouter();
  return useMutation({
    mutationFn: async (input: { mode: CheckMode; intake?: string; testId?: TestId }) => {
      const profileId = useCheck.getState().profileId ?? "p1";
      const session = await createSession({ profileId, intake: input.intake ?? "", mode: input.mode, testId: input.testId });
      return { session, ...input };
    },
    onSuccess: ({ session, mode, intake }) => {
      useCheck.getState().start(session, mode, intake ?? "");
      if (mode === "full") return router.push("/check/plan");
      const first = session.plan[0].testId;
      const needsCal = session.plan.some((p) => testInfo(p.testId).needsCalibration);
      if (needsCal && (mode !== "single" || !useCalibration.getState().calibrated)) return router.push("/check/calibrate");
      router.push(`/check/${first}/instructions`);
    },
  });
}
