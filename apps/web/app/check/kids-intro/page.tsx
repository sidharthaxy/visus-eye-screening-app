"use client";

import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Screen, Spacer } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TestPreview } from "@/components/TestArt";
import { useStartCheck } from "@/lib/useStartCheck";
import { listProfiles } from "@/services/profiles";
import { useCheck } from "@/store/check";

const STEPS = [
  "Sit next to your child, at the same eye level.",
  "Hold the screen 40 cm from their face, about the length of your forearm.",
  "Let them point or say the answer. You tap it for them.",
];

export default function KidsIntro() {
  const profileId = useCheck((s) => s.profileId);
  const q = useQuery({ queryKey: ["profiles"], queryFn: listProfiles });
  const kid = q.data?.find((p) => p.id === profileId);
  const start = useStartCheck();

  return (
    <Screen gap="gap-0">
      <ScreenHeader title="Kids mode" fallback="/check/who" />
      <div className="mt-4 grid h-[180px] flex-none place-items-center rounded-[24px] bg-[repeating-linear-gradient(135deg,#F0F0ED_0_10px,#EAEAE6_10px_20px)]">
        <div className="grid h-[148px] w-[calc(100%-32px)] place-items-center rounded-[18px] bg-white">
          <TestPreview id="kids_colour_shapes" />
        </div>
      </div>
      <span className="mt-5 text-[14px] font-semibold text-muted">For parents{kid ? ` · ${kid.name.split(" ")[0]}, ${kid.age}` : ""}</span>
      <h1 className="m-0 mt-1 text-[28px] font-bold leading-[1.15] tracking-[-0.025em]">Do this one together</h1>
      <ol className="m-0 mt-[18px] flex list-none flex-col gap-3 p-0">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-start gap-3">
            <span className="grid size-7 flex-none place-items-center rounded-full bg-acc-soft text-[14px] font-bold text-acc-ink">{i + 1}</span>
            <span className="pt-[3px] text-[16px] leading-[1.45] text-pretty">{s}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-none gap-3 rounded-[20px] bg-acc-soft px-4 py-3.5">
        <Icon name="sparkle" size={22} color="#194F81" className="mt-px flex-none" />
        <span className="text-[15px] leading-[1.45] text-ink-soft text-pretty">Try not to hint. If they get tired, pause and come back later.</span>
      </div>
      <Spacer />
      {start.isError && <p className="m-0 mb-3 text-center text-[14px] text-doc">Couldn&apos;t start. Try again.</p>}
      <Button disabled={start.isPending} onClick={() => start.mutate({ mode: "full", intake: "Kids check with a parent" })}>
        {start.isPending ? "Starting…" : "Start"}
      </Button>
    </Screen>
  );
}
