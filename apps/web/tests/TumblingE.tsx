"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/components/cn";
import { snellenMm } from "@/store/calibration";

import { TestFrame } from "./TestFrame";
import type { TestProps } from "./types";

export const DIRS = ["right", "down", "left", "up"] as const;
export type Dir = (typeof DIRS)[number];

/** Snellen denominators (6/x), largest first. */
const LINES = [60, 36, 24, 18, 12, 9, 6, 5];
const PER_LINE = 5;
/** Viewing distance for this test, from the design ("placed 2 m away · helper answers"). */
const DISTANCE_MM = 2000;

const randomDir = (not?: Dir): Dir => {
  const options = DIRS.filter((d) => d !== not);
  return options[Math.floor(Math.random() * options.length)];
};

/** Optotype E, 5×5 grid, open side facing `dir`. */
export function EGlyph({ size, dir }: { size: number; dir: Dir }) {
  return (
    <svg width={size} height={size} viewBox="0 0 5 5" className="block" style={{ transform: `rotate(${DIRS.indexOf(dir) * 90}deg)` }} aria-hidden>
      <path d="M0 0h5v1H0zM0 2h5v1H0zM0 4h5v1H0zM0 0h1v5H0z" fill="#111111" />
    </svg>
  );
}

export function ArrowPad({ onAnswer }: { onAnswer: (d: Dir) => void }) {
  const pad: [Dir, string, number][] = [
    ["left", "Left", 180],
    ["up", "Up", 270],
    ["down", "Down", 90],
    ["right", "Right", 0],
  ];
  return (
    <div className="mt-3 grid flex-none grid-cols-4 gap-2.5">
      {pad.map(([d, label, rot]) => (
        <button
          key={d}
          type="button"
          aria-label={label}
          onClick={() => onAnswer(d)}
          className="grid h-[76px] place-items-center rounded-[18px] border border-line-strong bg-white transition-[transform,background] duration-150 hover:bg-[#FBFBF9] active:scale-[.94] active:bg-fill"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rot}deg)` }}>
            <path d="M4 12h15M13 6l6 6-6 6" />
          </svg>
        </button>
      ))}
    </div>
  );
}

/** Arrow keys answer on a keyboard. */
export function useArrowKeys(onAnswer: (d: Dir) => void, disabled: boolean) {
  const cb = useRef(onAnswer);
  useEffect(() => {
    cb.current = onAnswer;
  });
  useEffect(() => {
    if (disabled) return;
    const KEYS: Record<string, Dir> = { ArrowLeft: "left", ArrowUp: "up", ArrowDown: "down", ArrowRight: "right" };
    const onKey = (e: KeyboardEvent) => {
      const d = KEYS[e.key];
      if (!d) return;
      e.preventDefault();
      cb.current(d);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [disabled]);
}

type Trial = { line: string; shown: Dir; answer: Dir; sizeMm: number };

/** Screen 26. Lines get smaller; the test stops after 3 misses on a line or after the last line. */
export function TumblingE({ eye, pxPerMm, paused, onDone, onExit, onPause }: TestProps) {
  const [line, setLine] = useState(0);
  const [pos, setPos] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [dir, setDir] = useState<Dir>(() => randomDir());
  const trials = useRef<Trial[]>([]);

  const den = LINES[line];
  const sizeMm = snellenMm(den, DISTANCE_MM);

  const answer = (d: Dir) => {
    trials.current.push({ line: `6/${den}`, shown: dir, answer: d, sizeMm: +sizeMm.toFixed(2) });
    const misses = wrong + (d === dir ? 0 : 1);
    const lineDone = pos + 1 === PER_LINE;
    if (misses >= 3 || (lineDone && line === LINES.length - 1)) {
      onDone({ distanceMm: DISTANCE_MM, pxPerMm, trials: trials.current });
      return;
    }
    if (lineDone) {
      setLine(line + 1);
      setPos(0);
      setWrong(0);
    } else {
      setPos(pos + 1);
      setWrong(misses);
    }
    setDir(randomDir(dir));
  };

  useArrowKeys(answer, paused);

  return (
    <TestFrame title="Distance acuity" eye={eye} progress={`Line ${line + 1} of ${LINES.length} · 6/${den}`} onExit={onExit} onPause={onPause}>
      <div className="mt-3.5 grid min-h-0 flex-1 place-items-center overflow-hidden rounded-[24px] border border-line bg-white">
        <EGlyph size={sizeMm * pxPerMm} dir={dir} />
      </div>
      <div className="mt-3.5 flex flex-none justify-center gap-1.5" aria-hidden>
        {Array.from({ length: PER_LINE }, (_, i) => (
          <span key={i} className={cn("size-2 rounded-full transition-colors duration-200", i < pos ? "bg-ink" : i === pos ? "bg-acc" : "bg-line-option")} />
        ))}
      </div>
      <p className="m-0 mt-3.5 flex-none text-center text-[16px] font-semibold">Which way is the E pointing?</p>
      <ArrowPad onAnswer={answer} />
      <div className="mt-3.5 flex flex-none items-center justify-center gap-2 text-[13px] text-muted">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none">
          <path d="M3 12h18M6 9l-3 3 3 3M18 9l3 3-3 3" />
        </svg>
        <span>
          Screen 2 m away · helper answers<span className="hidden pointer-fine:inline"> · arrow keys work</span>
        </span>
      </div>
    </TestFrame>
  );
}
