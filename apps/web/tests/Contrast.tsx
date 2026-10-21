"use client";

import { useState } from "react";

import { cn } from "@/components/cn";

import { TestFrame, TestFooter } from "./TestFrame";
import type { TestProps } from "./types";

const LETTERS = ["H", "O", "V", "K", "Z", "N"];
/** Grey levels on white, darkest to faintest. */
const SHADES = ["#111111", "#888888", "#C4C4C4", "#E1E1E1", "#F1F1F1", "#F8F8F8"];
/** Physical letter height at 40 cm. Figtree caps are ~0.7 of the font size. */
const LETTER_MM = 7;

/** Screen 32. Tap the faintest letter you can still see. */
export function Contrast({ eye, pxPerMm, onDone, onExit, onPause }: TestProps) {
  const [sel, setSel] = useState<number | null>(null);
  const [none, setNone] = useState(false);
  const fontPx = Math.min((LETTER_MM / 0.7) * pxPerMm, 46);

  return (
    <TestFrame title="Contrast sensitivity" eye={eye} progress="Hold at 40 cm" onExit={onExit} onPause={onPause}>
      <h1 className="m-0 mt-[18px] flex-none text-[26px] font-bold leading-[1.2] tracking-[-0.025em] text-balance">Tap the faintest letter you can see</h1>
      <div className="mt-4 flex min-h-0 flex-1 flex-col justify-center rounded-[24px] border border-line bg-white p-3">
        <div className="grid grid-cols-6 gap-1.5">
          {LETTERS.map((l, i) => (
            <button
              key={l}
              type="button"
              aria-pressed={sel === i}
              aria-label={`Letter ${i + 1} of 6`}
              onClick={() => {
                setSel(sel === i ? null : i);
                setNone(false);
              }}
              className={cn(
                "h-[92px] rounded-[14px] border p-0 font-bold transition-[border-color,box-shadow,background] duration-150",
                sel === i ? "border-ink bg-card-hover shadow-[inset_0_0_0_1px_#111111]" : "border-transparent hover:border-line",
              )}
              style={{ color: SHADES[i], fontSize: fontPx }}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="mt-[18px] flex items-center gap-2.5 px-1 text-[12px] font-semibold text-[#8A8A85]">
          <span>Darker</span>
          <span className="h-px flex-1 bg-[linear-gradient(90deg,#111111,#F2F2EF)]" />
          <span>Fainter</span>
        </div>
      </div>
      <TestFooter
        summary={none ? "Can't see any letters" : sel == null ? "Letters get fainter left to right" : `Faintest seen: letter ${sel + 1} of 6`}
        alt="Can't see any"
        altOn={none}
        onAlt={() => {
          setNone(!none);
          setSel(null);
        }}
        canNext={none || sel != null}
        onNext={() => onDone({ faintestSeen: none ? null : sel, shades: SHADES, letters: LETTERS, letterMm: +((fontPx * 0.7) / pxPerMm).toFixed(2) })}
      />
    </TestFrame>
  );
}
