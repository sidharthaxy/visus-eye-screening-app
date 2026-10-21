"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { CheckGuard } from "@/components/CheckGuard";
import { cn } from "@/components/cn";
import { Icon } from "@/components/Icon";
import { Screen, Spacer } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TEST_COPY } from "@/lib/tests";
import { nextPlannedTest, useCheck } from "@/store/check";

export default function RedFlag() {
  return (
    <CheckGuard>
      <RedFlagScreen />
    </CheckGuard>
  );
}

function RedFlagScreen() {
  const { lastStep, plan, done, mode } = useCheck();
  const [saved, setSaved] = useState(false);
  if (!lastStep || lastStep.type !== "red_flag") return <Screen />;

  const { result, finding } = lastStep;
  const next = nextPlannedTest({ plan, done });
  const continueHref = mode === "single" ? `/tests/${result.testId}/done` : next ? `/check/${next}/instructions` : "/check/analysing";

  return (
    <Screen gap="gap-0">
      <ScreenHeader left="close" leftLabel="Exit check" title={TEST_COPY[result.testId].title} right={mode === "single" ? undefined : `${done.length} of ${plan.length}`} fallback="/home" />
      <div className="mt-7 grid size-16 flex-none place-items-center rounded-full bg-doc-bg text-doc">
        <Icon name="alert" size={30} />
      </div>
      <h1 className="m-0 mt-5 text-[28px] font-bold leading-[1.15] tracking-[-0.025em]">Visit an eye doctor soon</h1>
      <p className="m-0 mt-2 text-[16px] leading-normal text-muted text-pretty">Something in this test is worth a professional look, ideally within the next week.</p>

      <div className="mt-5 flex flex-none flex-col rounded-[20px] border border-line bg-white px-4 py-1">
        <span className="pb-0.5 pt-3 text-[13px] font-bold text-muted">What we noticed</span>
        <div className="flex min-h-14 items-center gap-3">
          <span className="size-2 flex-none rounded-full bg-doc-dot" />
          <span className="flex-1 text-[16px] font-semibold">{finding}</span>
        </div>
        <div className="flex min-h-14 items-center gap-3 border-t border-divider">
          <span className="size-2 flex-none rounded-full bg-faint" />
          <span className="flex-1 text-[15px] text-ink-soft">{result.summary}</span>
        </div>
      </div>

      <p className="m-0 mt-3.5 text-[13px] leading-[1.45] text-muted text-pretty">This isn&apos;t a diagnosis. If your vision suddenly gets worse, go to a doctor today.</p>

      <Spacer />
      <div className="flex flex-none flex-col gap-2.5">
        <Button
          onClick={() => window.open("https://www.google.com/maps/search/eye+doctor+near+me", "_blank", "noopener")}
          leading={<Icon name="pin" size={20} />}
        >
          Find eye doctors nearby
        </Button>
        <Button
          variant="secondary"
          onClick={() => setSaved(!saved)}
          className={cn(saved && "border-[#9FD1B2]!")}
          leading={saved ? <Icon name="checkLg" size={20} color="#1D6A3E" strokeWidth={2.4} /> : <Icon name="download" size={20} />}
        >
          {saved ? "Report saved" : "Save report"}
        </Button>
        <Button href={continueHref} variant="ghost">
          Continue check
        </Button>
      </div>
    </Screen>
  );
}
