"use client";

import { useParams } from "next/navigation";

import { Button } from "@/components/Button";
import { ErrorState } from "@/components/States";
import { Icon } from "@/components/Icon";
import { Screen, Spacer } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TestPreview } from "@/components/TestArt";
import { categoryOf, eyesLabel, isTestId, TEST_COPY, testInfo } from "@/lib/tests";
import { useStartCheck } from "@/lib/useStartCheck";

export default function TestDetail() {
  const { testId } = useParams<{ testId: string }>();
  const start = useStartCheck();
  if (!isTestId(testId)) return <ErrorState title="Test not found" body="We couldn't find that test." />;

  const t = testInfo(testId);
  const copy = TEST_COPY[testId];
  const facts = [
    ["Time", `${t.minutes} min`],
    ["For", `Ages ${t.minAge}+`],
    ["Eyes", t.kind === "questionnaire" ? "Questionnaire" : eyesLabel(t)],
  ];

  return (
    <Screen gap="gap-0">
      <ScreenHeader small title={categoryOf(t.category).label} fallback="/tests" />
      <div className="mt-4 grid h-[168px] flex-none place-items-center rounded-[24px] border border-line bg-white">
        <TestPreview id={testId} />
      </div>
      <h1 className="m-0 mt-5 text-[30px] font-bold leading-[1.15] tracking-[-0.025em]">{copy.title}</h1>
      <p className="m-0 mt-1 text-[16px] text-muted">{copy.subtitle}</p>

      <div className="mt-4 grid flex-none grid-cols-3 gap-2.5">
        {facts.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1 rounded-[16px] border border-line bg-white px-3.5 py-3">
            <span className="text-[12px] font-semibold text-muted">{k}</span>
            <span className="text-[17px] font-bold">{v}</span>
          </div>
        ))}
      </div>

      <h3 className="m-0 mt-5 text-[17px] font-bold">What it checks</h3>
      <p className="m-0 mt-1.5 text-[16px] leading-normal text-ink-soft text-pretty">{copy.checks}</p>

      <h3 className="m-0 mt-[18px] text-[17px] font-bold">Who it&apos;s for</h3>
      <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
        {copy.forWho.map((line) => (
          <li key={line} className="flex items-center gap-2.5 text-[16px] text-ink-soft">
            <span className="grid size-[22px] flex-none place-items-center rounded-full bg-acc-soft text-acc-ink">
              <Icon name="check" size={12} strokeWidth={2.4} />
            </span>
            {line}
          </li>
        ))}
      </ul>

      <Spacer />
      {start.isError && <p className="m-0 mb-3 text-center text-[14px] text-doc">Couldn&apos;t start the test. Try again.</p>}
      <Button arrow disabled={start.isPending} onClick={() => start.mutate({ mode: "single", testId })}>
        {start.isPending ? "Starting…" : "Start test"}
      </Button>
    </Screen>
  );
}
