"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/Button";
import { CheckGuard } from "@/components/CheckGuard";
import { cn } from "@/components/cn";
import { Icon } from "@/components/Icon";
import { Screen, Spacer } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ErrorState } from "@/components/States";
import { TestPreview } from "@/components/TestArt";
import { isTestId, TEST_COPY, testInfo } from "@/lib/tests";
import { useCheck } from "@/store/check";

export default function Instructions() {
  const { testId } = useParams<{ testId: string }>();
  if (!isTestId(testId)) return <ErrorState title="Test not found" body="We couldn't find that test." />;
  return (
    <CheckGuard>
      <InstructionsScreen testId={testId} />
    </CheckGuard>
  );
}

function InstructionsScreen({ testId }: { testId: Parameters<typeof testInfo>[0] }) {
  const t = testInfo(testId);
  const copy = TEST_COPY[testId];
  const plan = useCheck((s) => s.plan);
  const mode = useCheck((s) => s.mode);
  const index = plan.findIndex((p) => p.testId === testId);
  const [speaking, setSpeaking] = useState(-1);
  const playing = useRef(false);

  const heading =
    t.kind === "questionnaire"
      ? ["A few quick questions", "Answer honestly. There are no wrong answers."]
      : t.eachEye
        ? ["Cover your left eye", "We'll check your right eye first."]
        : ["Keep both eyes open", "This test uses both eyes together."];

  const stop = () => {
    playing.current = false;
    window.speechSynthesis?.cancel();
    setSpeaking(-1);
  };

  const listen = () => {
    if (playing.current) return stop();
    if (!("speechSynthesis" in window)) return;
    playing.current = true;
    const say = (i: number) => {
      if (!playing.current || i >= copy.steps.length) return stop();
      const u = new SpeechSynthesisUtterance(copy.steps[i]);
      u.lang = "en-GB";
      u.onstart = () => setSpeaking(i);
      u.onend = () => say(i + 1);
      window.speechSynthesis.speak(u);
    };
    window.speechSynthesis.cancel();
    say(0);
  };

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  return (
    <Screen gap="gap-0">
      <ScreenHeader title={copy.title} right={mode !== "single" && index >= 0 ? `${index + 1} of ${plan.length}` : undefined} fallback="/home" />
      <div className="mt-4 grid h-[200px] flex-none place-items-center rounded-[24px] bg-[repeating-linear-gradient(135deg,#F0F0ED_0_10px,#EAEAE6_10px_20px)]">
        <div className="grid h-[168px] w-[calc(100%-32px)] place-items-center rounded-[18px] bg-white">
          <TestPreview id={testId} />
        </div>
      </div>

      <h1 className="m-0 mt-[22px] text-[28px] font-bold leading-[1.15] tracking-[-0.025em]">{heading[0]}</h1>
      <p className="m-0 mt-1 text-[16px] text-muted">{heading[1]}</p>

      <ol className="m-0 mt-5 flex list-none flex-col gap-3 p-0">
        {copy.steps.map((step, i) => (
          <li key={step} className="flex items-start gap-3">
            <span className={cn("grid size-7 flex-none place-items-center rounded-full text-[14px] font-bold transition-colors duration-300", i === speaking ? "bg-ink text-white" : "bg-acc-soft text-acc-ink")}>{i + 1}</span>
            <span className={cn("pt-[3px] text-[16px] leading-[1.45] transition-colors duration-300 text-pretty", speaking === -1 || i === speaking ? "text-ink" : "text-faint")}>{step}</span>
          </li>
        ))}
      </ol>

      {t.kind === "visual" && (
        <div className="mt-4 flex min-h-11 flex-none items-center gap-2.5 rounded-[14px] border border-line bg-white px-3.5 text-[14px] text-ink-soft">
          <Icon name="glasses" size={18} strokeWidth={1.9} className="flex-none" />
          <span>Keep your glasses on for this test. Screen brightness up to full.</span>
        </div>
      )}

      <Spacer />
      <div className="flex flex-none gap-2.5">
        <button
          type="button"
          onClick={listen}
          aria-label={speaking >= 0 ? "Stop" : "Listen"}
          className={cn(
            "flex h-btn flex-none items-center gap-2 rounded-[16px] border px-[18px] text-[16px] font-semibold transition-colors duration-200",
            speaking >= 0 ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink hover:bg-card-hover",
          )}
        >
          <Icon name={speaking >= 0 ? "stop" : "speaker"} size={20} />
          {speaking >= 0 ? "Stop" : "Listen"}
        </button>
        <Button href={`/check/${testId}/run${mode === "single" ? "?mode=single" : ""}`} className="flex-1" onClick={stop}>
          I&apos;m ready
        </Button>
      </div>
    </Screen>
  );
}
