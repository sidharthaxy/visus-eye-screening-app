"use client";

import { useState } from "react";

import { TestFrame, TestFooter } from "./TestFrame";
import { COVER_LABEL, type TestProps } from "./types";

const N = 10;

/** Screen 31. Keep looking at the dot, tap areas that look wavy, blurry or missing. */
export function Amsler({ eye, onDone, onExit, onPause }: TestProps) {
  const [cells, setCells] = useState<boolean[]>(() => Array(N * N).fill(false));
  const [straight, setStraight] = useState(false);
  const marked = cells.flatMap((on, i) => (on ? [i] : []));

  return (
    <TestFrame title="Amsler grid" eye={eye} progress={COVER_LABEL[eye]} onExit={onExit} onPause={onPause}>
      <h1 className="m-0 mt-[18px] flex-none text-[26px] font-bold leading-[1.2] tracking-[-0.025em] text-balance">Keep looking at the dot</h1>
      <p className="m-0 mt-1.5 flex-none text-[16px] leading-normal text-muted text-pretty">Tap any areas where lines look wavy, blurry or missing.</p>
      <div className="mt-4 flex min-h-[200px] flex-1 items-start justify-center [container-type:size]">
        <div className="relative grid size-[min(100cqw,100cqh)] grid-cols-10 grid-rows-10 border-l border-t border-ink bg-white" role="group" aria-label="Amsler grid, 10 by 10">
          {cells.map((on, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={on}
              aria-label={`Row ${Math.floor(i / N) + 1}, column ${(i % N) + 1}`}
              onClick={() => {
                setCells(cells.map((v, k) => (k === i ? !v : v)));
                setStraight(false);
              }}
              className="border-b border-r border-ink p-0 transition-colors duration-150 focus-visible:outline-offset-[-2px]"
              style={{ background: on ? "#F6D3CD" : "transparent" }}
            />
          ))}
          <span className="pointer-events-none absolute left-1/2 top-1/2 -ml-1.5 -mt-1.5 size-3 rounded-full bg-ink" />
        </div>
      </div>
      <TestFooter
        summary={straight ? "All lines look straight" : marked.length ? `${marked.length} ${marked.length === 1 ? "area" : "areas"} marked` : "Nothing marked yet"}
        alt="All lines straight"
        altOn={straight}
        onAlt={() => {
          setStraight(!straight);
          setCells(Array(N * N).fill(false));
        }}
        next="Done"
        canNext={straight || marked.length > 0}
        onNext={() => onDone({ grid: N, marked, allStraight: straight })}
      />
    </TestFrame>
  );
}
