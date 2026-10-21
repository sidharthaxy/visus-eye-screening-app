"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/Button";
import { HeaderButton } from "@/components/ScreenHeader";

/** Screen 44: between the right and left eye of a test. Counts down from 3, then starts. */
export function SwitchEye({ title, onReady, onExit }: { title: string; onReady: () => void; onExit: () => void }) {
  const [left, setLeft] = useState(3);
  const ready = useRef(onReady);
  useEffect(() => {
    ready.current = onReady;
  });
  useEffect(() => {
    const t = left === 0 ? setTimeout(() => ready.current(), 600) : setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  return (
    <div className="flex h-full flex-col bg-pearl px-5 pb-8 pt-6">
      <div className="flex h-11 flex-none items-center">
        <HeaderButton icon="close" label="Exit test" onClick={onExit} />
        <span className="flex-1 text-center text-[17px] font-bold">{title}</span>
        <span className="w-11" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
        <span className="flex h-8 items-center gap-2 rounded-full bg-good-bg px-3.5 text-[14px] font-semibold text-good">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 7.5l3 3 6-7" />
          </svg>
          Right eye done
        </span>
        <div className="mt-8 flex gap-7">
          <div className="flex flex-col items-center gap-1">
            <span className="grid size-28 place-items-center rounded-full border-2 border-ink bg-white">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            <span className="mt-2 text-[15px] font-bold">Left eye</span>
            <span className="text-[13px] text-muted">Testing next</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="grid size-28 place-items-center rounded-full bg-ink">
              <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4a1.5 1.5 0 0 1 3 0v6M14 10V5.5a1.5 1.5 0 0 1 3 0V13c0 4-2.5 7.5-6.5 7.5-2.4 0-4-1.3-5.2-3.2L3.8 14a1.5 1.5 0 0 1 2.4-1.8L8 14" />
              </svg>
            </span>
            <span className="mt-2 text-[15px] font-bold">Right eye</span>
            <span className="text-[13px] text-muted">Cover it</span>
          </div>
        </div>
        <h1 className="m-0 mt-8 text-[30px] font-bold leading-[1.18] tracking-[-0.025em] text-balance">Now cover your right eye</h1>
        <p className="m-0 mt-2.5 max-w-[300px] text-[16px] leading-normal text-muted text-pretty">Use your palm, without pressing. We&apos;ll check your left eye next.</p>
        <div className="relative mt-7 grid size-[76px] place-items-center">
          <svg width="76" height="76" viewBox="0 0 76 76" className="absolute inset-0 -rotate-90">
            <circle cx="38" cy="38" r="34" fill="none" stroke="#E4E4E0" strokeWidth="3" />
            <circle
              cx="38"
              cy="38"
              r="34"
              fill="none"
              stroke="#111"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="213.6"
              strokeDashoffset={(213.6 * left) / 3}
              style={{ transition: left === 3 ? "none" : "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="relative text-[24px] font-bold tabular-nums">{left || "Go"}</span>
        </div>
        <span className="mt-2.5 text-[14px] text-muted">{left ? `Starting in ${left}…` : "Starting now"}</span>
      </div>
      <Button onClick={onReady}>I&apos;m ready</Button>
    </div>
  );
}

const Backdrop = ({ onClick }: { onClick: () => void }) => <div className="absolute inset-0 z-20 bg-[rgba(17,17,17,.42)]" onClick={onClick} />;

/** Screen 45: pause sheet over the test. */
export function PauseSheet({ subtitle, onResume, onRestart, onExit }: { subtitle: string; onResume: () => void; onRestart: () => void; onExit: () => void }) {
  return (
    <>
      <Backdrop onClick={onResume} />
      <div role="dialog" aria-modal aria-label="Test paused" className="absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-t-[28px] bg-white px-5 pb-[34px] pt-2.5 shadow-[0_-10px_30px_rgba(0,0,0,.12)]">
        <span className="h-[5px] w-9 self-center rounded-full bg-line-strong" />
        <div className="mt-[18px] flex items-center gap-3.5">
          <span className="grid size-12 flex-none place-items-center rounded-full bg-fill">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#111">
              <rect x="7" y="5.5" width="3.5" height="13" rx="1" />
              <rect x="13.5" y="5.5" width="3.5" height="13" rx="1" />
            </svg>
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[22px] font-bold tracking-[-0.015em]">Test paused</span>
            <span className="text-[14px] text-muted">{subtitle}</span>
          </div>
        </div>
        <div className="mt-[22px] flex flex-col gap-2.5">
          <Button
            onClick={onResume}
            leading={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5v13l10.5-6.5z" />
              </svg>
            }
          >
            Resume
          </Button>
          <Button
            variant="secondary"
            onClick={onRestart}
            leading={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
                <path d="M4.5 4.5v4h4" />
              </svg>
            }
          >
            Restart test
          </Button>
          <button type="button" onClick={onExit} className="flex h-[52px] items-center justify-center gap-2 rounded-[16px] text-btn font-semibold text-doc hover:bg-doc-bg/50">
            <ExitIcon />
            Exit check
          </button>
        </div>
      </div>
    </>
  );
}

const ExitIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4.5h4.5v15H14" />
    <path d="M10 8l-4 4 4 4M6 12h9.5" />
  </svg>
);

/** Screen 46: leave the check? */
export function ExitDialog({ finished, total, onLeave, onStay }: { finished: number; total: number; onLeave: () => void; onStay: () => void }) {
  return (
    <>
      <Backdrop onClick={onStay} />
      <div
        role="alertdialog"
        aria-modal
        aria-label="Leave the check?"
        className="absolute inset-x-6 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center rounded-[28px] bg-white px-5 pb-5 pt-6 text-center shadow-[0_20px_50px_rgba(0,0,0,.2)]"
      >
        <span className="grid size-14 place-items-center rounded-full bg-mild-bg">
          <ExitIcon color="#8A5A12" />
        </span>
        <h2 className="m-0 mt-4 text-[22px] font-bold tracking-[-0.015em]">Leave the check?</h2>
        <p className="m-0 mt-2 text-[16px] leading-normal text-muted text-pretty">Results from finished tests are saved.</p>
        <span className="mt-3.5 flex h-7 items-center rounded-full bg-fill px-3 text-[13px] font-semibold text-ink-soft">
          {finished} of {total} {total === 1 ? "test" : "tests"} finished
        </span>
        <div className="mt-[22px] grid grid-cols-2 gap-2.5 self-stretch">
          <Button variant="secondary" onClick={onLeave} className="text-doc!">
            Leave
          </Button>
          <Button onClick={onStay}>Stay</Button>
        </div>
      </div>
    </>
  );
}

/** Screen 47: shown over a test while the face is outside 35–45 cm. The test waits. */
export function DistanceWarning({ title, cm, onExit }: { title: string; cm: number; onExit: () => void }) {
  const close = cm < 35;
  const pos = Math.min(100, Math.max(0, ((cm - 15) / 60) * 100));
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-pearl px-5 pb-8 pt-6" role="alertdialog" aria-label="Distance warning">
      <div className="flex h-11 flex-none items-center">
        <HeaderButton icon="close" label="Exit test" onClick={onExit} />
        <span className="flex-1 text-center text-[17px] font-bold">{title}</span>
        <span className="w-11 text-right text-[13px] font-semibold text-muted">Paused</span>
      </div>
      <div className="relative mt-4 h-[390px] max-h-[48dvh] min-h-[220px] flex-none overflow-hidden rounded-[28px] bg-[#1F1F1E]">
        <div className="absolute left-1/2 top-[52%] h-[250px] max-h-[64%] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-dashed border-white/40" />
        <div
          className="absolute left-1/2 top-[52%] h-[232px] max-h-[60%] w-[176px] rounded-[50%] border-[2.5px] border-white transition-transform duration-500"
          style={{ transform: `translate(-50%,-50%) scale(${close ? 1.28 : 0.68})` }}
        />
        <div className="absolute left-1/2 top-4 flex h-9 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-mild-bg px-3.5 text-[15px] font-semibold text-mild">
          <span className="size-[7px] rounded-full bg-current" />
          {close ? "Move back a little" : "Move a bit closer"}
        </div>
        <div className="absolute bottom-3.5 left-4 flex items-center gap-1.5 text-[12px] font-semibold text-white/65">
          <span className="size-1.5 rounded-full bg-white/65" />
          Front camera
        </div>
      </div>
      <div className="mt-5 flex flex-none items-baseline justify-between gap-3">
        <span className="text-[34px] font-bold leading-none tracking-[-0.03em] tabular-nums">{Math.round(cm)} cm</span>
        <span className="text-[14px] text-muted">Aim for 35–45 cm</span>
      </div>
      <div className="relative mt-4 h-2 flex-none rounded-full bg-line">
        <div className="absolute inset-y-0 left-[33.3%] w-[16.7%] rounded-full bg-[#BFE3CC]" />
        <div className="absolute top-1/2 -ml-2.5 -mt-2.5 size-5 rounded-full border-[3px] border-white bg-ink shadow-[0_1px_4px_rgba(0,0,0,.25)] transition-[left] duration-500" style={{ left: `${pos}%` }} />
      </div>
      <div className="mt-2 flex flex-none justify-between text-[12px] text-[#8A8A85]">
        <span>Closer</span>
        <span>Further</span>
      </div>
      <div className="flex-1" />
      <div className="mb-3 flex flex-none items-center justify-center gap-2 text-[13px] text-muted">
        <span>The test waits until you&apos;re 35–45 cm away.</span>
      </div>
      <Button disabled>Waiting for the right distance</Button>
    </div>
  );
}
