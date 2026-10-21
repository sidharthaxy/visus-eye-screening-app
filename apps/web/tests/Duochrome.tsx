"use client";

import { useState } from "react";

import { Radio } from "@/components/Chip";
import { cn } from "@/components/cn";

import { TestFrame } from "./TestFrame";
import type { TestProps } from "./types";

const RED = "#D8432F";
const GREEN = "#2E9A50";
const SIDES = [
  [RED, ["Z", "HN", "CKR", "DOVS"]],
  [GREEN, ["H", "DK", "NZO", "SCRV"]],
] as const;
const SIZES = [52, 36, 26, 18];
const OPTIONS = [
  ["red", "Red side clearer", RED],
  ["same", "Same", `linear-gradient(90deg,${RED} 50%,${GREEN} 50%)`],
  ["green", "Green side clearer", GREEN],
] as const;

/** Screen 30. Which side looks clearer? Picking moves on. */
export function Duochrome({ eye, onDone, onExit, onPause }: TestProps) {
  const [pick, setPick] = useState<string | null>(null);

  const answer = (k: string) => {
    if (pick) return;
    setPick(k);
    setTimeout(() => onDone({ clearer: k }), 400);
  };

  return (
    <TestFrame title="Red-green test" eye={eye} progress="Glasses on" onExit={onExit} onPause={onPause}>
      <h1 className="m-0 mt-[18px] flex-none text-[26px] font-bold leading-[1.2] tracking-[-0.025em]">Which side looks clearer?</h1>
      <p className="m-0 mt-1.5 flex-none text-[16px] leading-normal text-muted">Compare the black letters on each side.</p>
      <div className="-mx-5 mt-4 grid min-h-[200px] flex-1 grid-cols-2">
        {SIDES.map(([bg, rows]) => (
          <div key={bg} className="flex flex-col items-center justify-center gap-4 font-bold leading-none text-ink" style={{ background: bg }}>
            {rows.map((r, i) => (
              <span key={r} className="tracking-[.14em]" style={{ fontSize: SIZES[i] }}>
                {r}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-none flex-col gap-2.5" role="radiogroup" aria-label="Which side looks clearer">
        {OPTIONS.map(([k, label, sw]) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={pick === k}
            onClick={() => answer(k)}
            className={cn(
              "flex min-h-14 items-center gap-3 rounded-[16px] border bg-white px-4 py-2.5 text-left text-opt font-medium transition-[border-color,box-shadow]",
              pick === k ? "border-ink shadow-[inset_0_0_0_1px_#111111]" : "border-line-option hover:border-[#CFCFCA]",
            )}
          >
            <span className="size-[22px] flex-none rounded-full" style={{ background: sw }} />
            <span className="flex-1">{label}</span>
            <Radio on={pick === k} />
          </button>
        ))}
      </div>
    </TestFrame>
  );
}
