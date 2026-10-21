"use client";

import { useState } from "react";

import { TestFrame, TestFooter } from "./TestFrame";
import { COVER_LABEL, type TestProps } from "./types";

const AXES = ["12–6", "1–7", "2–8", "3–9", "4–10", "5–11"];
const HOURS: [string, number, number][] = [
  ["12", 150, 21], ["1", 217, 39], ["2", 266, 88], ["3", 284, 155], ["4", 266, 222], ["5", 217, 271],
  ["6", 150, 289], ["7", 83, 271], ["8", 34, 222], ["9", 16, 155], ["10", 34, 88], ["11", 83, 39],
];

/** Screen 29. Tap the lines that look darker. */
export function ClockDial({ eye, onDone, onExit, onPause }: TestProps) {
  const [sel, setSel] = useState<boolean[]>(() => AXES.map(() => false));
  const [same, setSame] = useState(false);
  const picked = AXES.filter((_, i) => sel[i]);

  const toggle = (i: number) => {
    setSel(sel.map((v, k) => (k === i ? !v : v)));
    setSame(false);
  };

  return (
    <TestFrame title="Astigmatism dial" eye={eye} progress={COVER_LABEL[eye]} onExit={onExit} onPause={onPause}>
      <h1 className="m-0 mt-[18px] flex-none text-[26px] font-bold leading-[1.2] tracking-[-0.025em]">Do any lines look darker?</h1>
      <p className="m-0 mt-1.5 flex-none text-[16px] leading-normal text-muted text-pretty">Tap the lines that look darker or sharper than the rest.</p>
      <div className="mt-4 grid min-h-0 flex-1 place-items-center rounded-[24px] border border-line bg-white p-3">
        <svg viewBox="0 0 300 300" className="block h-full max-h-[300px] w-full max-w-[300px]">
          {AXES.map((label, i) => (
            <g
              key={label}
              transform={`rotate(${i * 30} 150 150)`}
              onClick={() => toggle(i)}
              role="checkbox"
              aria-checked={sel[i]}
              aria-label={`Line ${label}`}
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggle(i))}
              className="cursor-pointer outline-none"
            >
              <path d="M150 38V116M150 184V262" stroke="#000" strokeOpacity="0" strokeWidth="24" style={{ pointerEvents: "stroke" }} />
              <path
                d="M145 38V116M150 38V116M155 38V116M145 184V262M150 184V262M155 184V262"
                fill="none"
                stroke={sel[i] ? "#3C7EBE" : "#111111"}
                strokeWidth={sel[i] ? 3.4 : 2}
                style={{ transition: "stroke .2s, stroke-width .2s" }}
              />
            </g>
          ))}
          <circle cx="150" cy="150" r="3" fill="#111" />
          {HOURS.map(([n, x, y]) => (
            <text key={n} x={x} y={y} textAnchor="middle" fontSize="15" fontWeight="600" fill="#5F5F5B">
              {n}
            </text>
          ))}
        </svg>
      </div>
      <TestFooter
        summary={same ? "All lines look the same" : picked.length ? `Darker: ${picked.join(", ")}` : "No lines tapped yet"}
        alt="All look the same"
        altOn={same}
        onAlt={() => {
          setSame(!same);
          setSel(AXES.map(() => false));
        }}
        canNext={same || picked.length > 0}
        onNext={() => onDone({ darker: picked, allSame: same })}
      />
    </TestFrame>
  );
}
