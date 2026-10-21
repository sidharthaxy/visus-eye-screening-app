"use client";

import { useMemo, useRef, useState } from "react";

import { cn } from "@/components/cn";

import { makePlate, PlateSvg } from "./plate";
import { TestFrame } from "./TestFrame";
import type { TestProps } from "./types";

/** [number shown, answer options]. */
const PLATES: [string, string[]][] = [
  ["12", ["12", "17", "21", "72"]],
  ["74", ["74", "21", "71", "14"]],
  ["8", ["8", "3", "6", "9"]],
  ["29", ["29", "70", "20", "79"]],
  ["5", ["5", "2", "6", "3"]],
  ["3", ["3", "5", "8", "9"]],
  ["15", ["15", "17", "13", "16"]],
  ["45", ["45", "46", "15", "48"]],
  ["6", ["6", "5", "8", "9"]],
  ["73", ["73", "78", "13", "23"]],
  ["16", ["16", "18", "10", "76"]],
  ["2", ["2", "7", "5", "3"]],
];

/** Screen 33. One plate at a time; picking an answer moves on. */
export function ColourPlates({ eye, onDone, onExit, onPause }: TestProps) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const answers = useRef<{ plate: number; shown: string; answer: string | null }[]>([]);
  const [shown, options] = PLATES[i];
  const dots = useMemo(() => makePlate({ text: shown }, 11 + i * 7, i % 2), [shown, i]);
  const order = useMemo(() => [...options].sort((a, b) => (a + i).localeCompare(b + i)), [options, i]);

  const answer = (a: string | null) => {
    if (pick !== null) return;
    setPick(a ?? "none");
    answers.current.push({ plate: i + 1, shown, answer: a });
    setTimeout(() => {
      if (i === PLATES.length - 1) return onDone({ plates: answers.current });
      setI(i + 1);
      setPick(null);
    }, 350);
  };

  const btn = (on: boolean) => cn("transition-[background,color,border-color,transform] duration-200 active:scale-[.97] border", on ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink hover:bg-card-hover");

  return (
    <TestFrame title="Colour vision" eye={eye} progress={`Plate ${i + 1} of ${PLATES.length}`} onExit={onExit} onPause={onPause}>
      <h1 className="m-0 mt-[18px] flex-none text-[26px] font-bold leading-[1.2] tracking-[-0.025em] text-balance">What number do you see?</h1>
      <div className="mx-auto mt-5 flex size-[300px] max-w-full flex-none items-center justify-center rounded-full">
        <PlateSvg dots={dots} />
      </div>
      <div className="min-h-3 flex-1" />
      <div className="grid flex-none grid-cols-2 gap-2.5">
        {order.map((o) => (
          <button key={o} type="button" onClick={() => answer(o)} className={cn("h-16 rounded-[16px] text-[24px] font-bold", btn(pick === o))}>
            {o}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => answer(null)} className={cn("mt-2.5 h-14 flex-none rounded-[16px] text-[16px] font-semibold", btn(pick === "none"))}>
        I don&apos;t see a number
      </button>
    </TestFrame>
  );
}
