"use client";

import { useMemo, useRef, useState } from "react";

import { cn } from "@/components/cn";
import { snellenMm } from "@/store/calibration";

import { makePlate, PlateSvg, type Figure } from "./plate";
import { TestFrame } from "./TestFrame";
import { DIRS, EGlyph, useArrowKeys, type Dir } from "./TumblingE";
import type { TestProps } from "./types";

const STAR = "M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z";

function Buddy({ bob, text }: { bob: boolean; text: string }) {
  return (
    <div className="mt-3.5 flex flex-none items-center gap-3">
      <span
        className="grid size-14 flex-none place-items-center rounded-full bg-acc-soft transition-transform duration-[350ms] ease-[cubic-bezier(.3,1.6,.5,1)]"
        style={{ transform: bob ? "translateY(-6px) rotate(-8deg)" : "none" }}
      >
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <circle cx="11.5" cy="14" r="3" fill="#111" />
          <circle cx="22.5" cy="14" r="3" fill="#111" />
          <path d="M11 21.5c1.6 2 3.6 3 6 3s4.4-1 6-3" stroke="#111" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
      <div className="min-w-0 flex-1 rounded-[18px_18px_18px_6px] border border-line bg-white px-4 py-3 text-[16px] font-semibold leading-[1.35]" aria-live="polite">
        {text}
      </div>
    </div>
  );
}

function ParentNote() {
  return (
    <div className="mt-3.5 flex flex-none items-center justify-center gap-2 text-[14px] font-semibold text-ink-soft">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none">
        <circle cx="8" cy="7" r="3" />
        <circle cx="17" cy="9.5" r="2.3" />
        <path d="M2.5 20c.6-3.6 2.8-5.5 5.5-5.5s4.9 1.9 5.5 5.5M14 15.2c.9-.5 1.9-.7 3-.7 2.3 0 4 1.6 4.5 4.5" />
      </svg>
      <span>Parent, help your child answer.</span>
    </div>
  );
}

const KID_LINES = [60, 36, 24, 18, 12, 9];
const PER_LINE = 5;
/** Kids mode intro: "Hold the phone 40 cm from their face". */
const KID_DISTANCE_MM = 400;

/** Screen 34. Every answer earns a star; the app never says right or wrong. */
export function KidsTumblingE({ eye, pxPerMm, paused, onDone, onExit, onPause }: TestProps) {
  const [line, setLine] = useState(0);
  const [pos, setPos] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [stars, setStars] = useState(0);
  const [pop, setPop] = useState(false);
  const [dir, setDir] = useState<Dir>(() => DIRS[Math.floor(Math.random() * 4)]);
  const trials = useRef<{ line: string; shown: Dir; answer: Dir }[]>([]);
  const den = KID_LINES[line];

  const answer = (d: Dir) => {
    trials.current.push({ line: `6/${den}`, shown: dir, answer: d });
    setStars(stars + 1);
    setPop(true);
    setTimeout(() => setPop(false), 900);
    const misses = wrong + (d === dir ? 0 : 1);
    const lineDone = pos + 1 === PER_LINE;
    if (misses >= 3 || (lineDone && line === KID_LINES.length - 1)) return onDone({ distanceMm: KID_DISTANCE_MM, pxPerMm, trials: trials.current });
    if (lineDone) {
      setLine(line + 1);
      setPos(0);
      setWrong(0);
    } else {
      setPos(pos + 1);
      setWrong(misses);
    }
    const others = DIRS.filter((x) => x !== dir);
    setDir(others[Math.floor(Math.random() * others.length)]);
  };
  useArrowKeys(answer, paused);

  const filled = pop && pos === 0 && stars > 0 ? PER_LINE : pos;
  const pad = (d: Dir, label: string, rot: number, area: string) => (
    <button
      type="button"
      aria-label={label}
      onClick={() => answer(d)}
      className="grid h-[76px] place-items-center rounded-[22px] border border-line-strong bg-white transition-[transform,background] duration-150 hover:bg-[#FBFBF9] active:scale-[.94] active:bg-fill"
      style={{ gridArea: area }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rot}deg)` }}>
        <path d="M4 12h15M13 6l6 6-6 6" />
      </svg>
    </button>
  );

  return (
    <TestFrame title="Kids · Tumbling E" eye={eye} progress={`Line ${line + 1} of ${KID_LINES.length}`} onExit={onExit} onPause={onPause}>
      <Buddy bob={pop} text={pop ? (filled === PER_LINE ? "Wow, 5 stars! Next line!" : "Yay! You got a star!") : "Which way are the E's legs pointing?"} />
      <div className="mt-3 grid min-h-[120px] flex-1 place-items-center overflow-hidden rounded-[24px] border border-line bg-white">
        <EGlyph size={snellenMm(den, KID_DISTANCE_MM) * pxPerMm} dir={dir} />
      </div>
      <div className="mt-3 flex flex-none justify-center gap-2" aria-hidden>
        {Array.from({ length: PER_LINE }, (_, j) => (
          <svg key={j} width="24" height="24" viewBox="0 0 24 24" className="block transition-transform duration-300" style={{ transform: pop && j === filled - 1 ? "scale(1.3)" : "none" }}>
            <path d={STAR} fill={j < filled ? "#F2B233" : "#E4E4E0"} className="transition-[fill] duration-200" />
          </svg>
        ))}
      </div>
      <div className="mt-3.5 grid flex-none grid-cols-3 grid-rows-[repeat(3,76px)] gap-2.5" style={{ gridTemplateAreas: '". u ." "l s r" ". d ."' }}>
        {pad("up", "Up", 270, "u")}
        {pad("left", "Left", 180, "l")}
        <div className="flex items-center justify-center gap-1.5 text-[22px] font-bold" style={{ gridArea: "s" }} aria-label={`${stars} stars`}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d={STAR} fill="#F2B233" />
          </svg>
          {stars}
        </div>
        {pad("right", "Right", 0, "r")}
        {pad("down", "Down", 90, "d")}
      </div>
      <ParentNote />
    </TestFrame>
  );
}

const SHAPE_PLATES: Figure[] = [{ shape: "star" }, { shape: "circle" }, { shape: "square" }, { shape: "none" }, { shape: "circle" }, { shape: "star" }];
const CHOICES = [
  ["star", "Star", <path key="s" d={STAR} />],
  ["circle", "Circle", <circle key="c" cx="12" cy="12" r="8.5" />],
  ["square", "Square", <rect key="q" x="4" y="4" width="16" height="16" rx="2" />],
  [
    "none",
    "Nothing",
    <g key="n">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M6 18L18 6" />
    </g>,
  ],
] as const;

/** Screen 35. Which shape is hiding in the dots? */
export function KidsColourShapes({ eye, onDone, onExit, onPause }: TestProps) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const answers = useRef<{ plate: number; shown: string; answer: string }[]>([]);
  const fig = SHAPE_PLATES[i];
  const dots = useMemo(() => makePlate(fig, 29 + i * 5, 1), [fig, i]);

  const answer = (a: string) => {
    if (pick) return;
    setPick(a);
    answers.current.push({ plate: i + 1, shown: "shape" in fig ? fig.shape : "", answer: a });
    setTimeout(() => {
      if (i === SHAPE_PLATES.length - 1) return onDone({ plates: answers.current });
      setI(i + 1);
      setPick(null);
    }, 700);
  };

  return (
    <TestFrame title="Kids · Colour shapes" eye={eye} progress={`Plate ${i + 1} of ${SHAPE_PLATES.length}`} onExit={onExit} onPause={onPause}>
      <Buddy bob={!!pick} text={pick ? "Great looking! On to the next one." : "What shape is hiding in the dots?"} />
      <div className="mx-auto mt-4 flex size-[300px] max-w-full flex-none items-center justify-center rounded-full">
        <PlateSvg dots={dots} />
      </div>
      <div className="min-h-3 flex-1" />
      <div className="grid flex-none grid-cols-2 gap-2.5">
        {CHOICES.map(([k, label, icon]) => (
          <button
            key={k}
            type="button"
            onClick={() => answer(k)}
            className={cn(
              "flex h-[72px] items-center justify-center gap-2.5 rounded-[18px] border text-[18px] font-semibold transition-[background,color,border-color,transform] duration-200 active:scale-[.97]",
              pick === k ? "border-ink bg-ink text-white" : "border-line-strong bg-white hover:bg-card-hover",
            )}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {icon}
            </svg>
            {label}
          </button>
        ))}
      </div>
      <ParentNote />
    </TestFrame>
  );
}
