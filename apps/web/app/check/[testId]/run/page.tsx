"use client";

import type { Eye, TestId } from "@visus/shared";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CheckGuard } from "@/components/CheckGuard";
import { ErrorState, LoadingState } from "@/components/States";
import { isTestId, TEST_COPY, testInfo } from "@/lib/tests";
import { DISTANCE_OK, useDistance } from "@/lib/useDistance";
import { submitResult } from "@/services/sessions";
import { useCalibration } from "@/store/calibration";
import { useCheck } from "@/store/check";
import { TESTS } from "@/tests";
import { DistanceWarning, ExitDialog, GlassesOn, PauseSheet, SwitchEye } from "@/tests/Overlays";
import { EYE_LABEL, type Answers } from "@/tests/types";

export default function Run() {
  const { testId } = useParams<{ testId: string }>();
  if (!isTestId(testId)) return <ErrorState title="Test not found" body="We couldn't find that test." />;
  return (
    <CheckGuard>
      <RunScreen testId={testId} />
    </CheckGuard>
  );
}

type Phase = "test" | "switch" | "glasses-on";

function RunScreen({ testId }: { testId: TestId }) {
  const router = useRouter();
  const Test = TESTS[testId];
  const info = testInfo(testId);
  const pxPerMm = useCalibration((s) => s.pxPerMm);
  const { sessionId, mode, plan, done } = useCheck();

  const [eye, setEye] = useState<Eye>(info.eachEye ? "right" : "both");
  const [phase, setPhase] = useState<Phase>("test");
  const [overlay, setOverlay] = useState<"pause" | "exit" | null>(null);
  const [attempt, setAttempt] = useState(0);
  const cm = useDistance();
  const offDistance = info.kind === "visual" && cm != null && (cm < DISTANCE_OK.min || cm > DISTANCE_OK.max);
  const glasses = mode === "glasses";
  const [round, setRound] = useState(0);
  const perEye = useRef<Partial<Record<Eye, Answers>>>({});
  const rounds = useRef<Partial<Record<Eye, Answers>>[]>([]);
  const started = useRef(0);

  useEffect(() => {
    started.current = Date.now();
  }, [attempt]);

  // Escape pauses, as on a phone's back gesture.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOverlay((o) => (o ? null : "pause"));
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const send = useMutation({
    mutationFn: (answers: Answers) =>
      submitResult(sessionId!, {
        testId,
        eye: "both",
        answers,
        durationSec: Math.round((Date.now() - started.current) / 1000),
      }),
    onSuccess: (step, answers) => {
      useCheck.getState().saveAnswers(testId, answers);
      useCheck.getState().recordStep(step);
      if (step.type === "red_flag") return router.replace("/check/red-flag");
      if (mode === "single") return router.replace(`/tests/${testId}/done`);
      if (glasses) return router.replace("/check/glasses/result");
      router.replace(step.type === "next_test" ? "/check/next" : "/check/analysing");
    },
  });

  const onDone = (answers: Answers) => {
    if (!info.eachEye) return send.mutate(answers);
    perEye.current[eye] = answers;
    if (eye === "right") return setPhase("switch");
    const both = { right: perEye.current.right, left: perEye.current.left };
    if (!glasses) return send.mutate(both);
    rounds.current[round] = both;
    if (round === 0) return setPhase("glasses-on");
    send.mutate({ glassesOff: rounds.current[0], glassesOn: rounds.current[1] });
  };

  const restart = () => {
    perEye.current = {};
    rounds.current = [];
    setRound(0);
    setEye(info.eachEye ? "right" : "both");
    setPhase("test");
    setOverlay(null);
    setAttempt((n) => n + 1);
  };

  if (send.isPending || send.isSuccess) return <LoadingState label="Saving your answers…" />;
  if (send.isError)
    return <ErrorState title="Couldn't save your answers" body="Check your connection and try again. Your answers are kept." onRetry={() => send.mutate(send.variables!)} />;

  return (
    <div className="relative min-h-dvh">
      {phase === "glasses-on" ? (
        <GlassesOn
          onReady={() => {
            perEye.current = {};
            setRound(1);
            setEye("right");
            setPhase("test");
          }}
        />
      ) : phase === "switch" ? (
        <SwitchEye
          title={TEST_COPY[testId].title}
          onExit={() => setOverlay("exit")}
          onReady={() => {
            setEye("left");
            setPhase("test");
          }}
        />
      ) : (
        <Test
          key={`${attempt}-${round}-${eye}`}
          eye={eye}
          pxPerMm={pxPerMm}
          paused={overlay !== null || offDistance}
          onDone={onDone}
          onExit={() => setOverlay("exit")}
          onPause={() => setOverlay("pause")}
        />
      )}
      {offDistance && overlay === null && <DistanceWarning title={TEST_COPY[testId].title} cm={cm!} onExit={() => setOverlay("exit")} />}
      {overlay === "pause" && (
        <PauseSheet
          subtitle={`${TEST_COPY[testId].title} · ${EYE_LABEL[eye]}`}
          onResume={() => setOverlay(null)}
          onRestart={restart}
          onExit={() => setOverlay("exit")}
        />
      )}
      {overlay === "exit" && (
        <ExitDialog
          finished={done.length}
          total={mode === "single" ? 1 : plan.length}
          onStay={() => setOverlay(null)}
          onLeave={() => router.replace(mode === "single" ? `/tests/${testId}` : "/home")}
        />
      )}
    </div>
  );
}
