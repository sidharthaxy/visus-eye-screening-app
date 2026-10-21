"use client";

import { useEffect, useRef, useState } from "react";

import { Pill } from "@/components/Chip";
import { Icon } from "@/components/Icon";
import { HeaderButton } from "@/components/ScreenHeader";

import { FIELD_POINTS } from "./PeripheralMap";
import { EYE_LABEL, type TestProps } from "./types";

const FLASH_MS = 300;
/** A tap within this time after a flash counts as seen. */
const WINDOW_MS = 1200;

const shuffle = (n: number) => {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Screen 57. Dots flash around the centre; the user taps (or presses Space) when they see one. */
export function Peripheral({ eye, paused, onDone, onExit, onPause }: TestProps) {
  const [order] = useState(() => shuffle(FIELD_POINTS.length));
  const seen = useRef<boolean[]>(Array(FIELD_POINTS.length).fill(false));
  const reaction = useRef<(number | null)[]>(Array(FIELD_POINTS.length).fill(null));
  const falseTaps = useRef(0);
  const flashAt = useRef(0);
  const [n, setN] = useState(0);
  const [on, setOn] = useState(false);
  const [hit, setHit] = useState(false);
  const point = order[Math.min(n, FIELD_POINTS.length - 1)];

  // One flash per step: wait, flash, then leave a window to respond.
  useEffect(() => {
    if (paused || n >= FIELD_POINTS.length) return;
    const wait = 700 + Math.random() * 900;
    const t1 = setTimeout(() => {
      flashAt.current = performance.now();
      setOn(true);
    }, wait);
    const t2 = setTimeout(() => setOn(false), wait + FLASH_MS);
    const t3 = setTimeout(() => setN((x) => x + 1), wait + WINDOW_MS);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [n, paused]);

  const sent = useRef(false);
  useEffect(() => {
    if (n < FIELD_POINTS.length || sent.current) return;
    sent.current = true;
    onDone({ seen: seen.current, reactionMs: reaction.current, falseTaps: falseTaps.current });
  }, [n, onDone]);

  const tap = () => {
    const dt = performance.now() - flashAt.current;
    if (flashAt.current && dt < WINDOW_MS && !seen.current[point]) {
      seen.current[point] = true;
      reaction.current[point] = Math.round(dt);
    } else falseTaps.current += 1;
    setHit(true);
    setTimeout(() => setHit(false), 450);
  };

  const tapRef = useRef(tap);
  useEffect(() => {
    tapRef.current = tap;
  });
  useEffect(() => {
    if (paused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      tapRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused]);

  const p = FIELD_POINTS[point];
  return (
    <div className="min-h-dvh bg-white">
    <div className="mx-auto flex h-dvh min-h-[600px] w-full max-w-[760px] flex-col px-5 pb-8 pt-6 md:pt-8">
      <div className="flex h-11 flex-none items-center">
        <HeaderButton icon="close" label="Exit test" onClick={onExit} />
        <span className="flex-1 text-center text-[17px] font-bold">Peripheral vision</span>
        <HeaderButton icon="pause" label="Pause test" onClick={onPause} />
      </div>
      <div className="mt-4 flex flex-none items-center justify-between gap-3">
        <Pill label={EYE_LABEL[eye]} leading={<Icon name="eye" size={16} />} />
        <span className="text-[14px] font-semibold tabular-nums text-muted">
          Dot {Math.min(n + 1, FIELD_POINTS.length)} of {FIELD_POINTS.length}
        </span>
      </div>
      <p className="m-0 mt-[18px] flex-none text-center text-[20px] font-bold tracking-[-0.01em]">Keep looking at the dot.</p>
      <div className="relative mt-2 min-h-[200px] flex-1">
        <span className="absolute left-1/2 top-1/2 -ml-[22px] -mt-[22px] size-11 rounded-full border border-line-option" />
        <span className="absolute left-1/2 top-1/2 -ml-[7px] -mt-[7px] size-3.5 rounded-full bg-ink" />
        <span
          className="absolute -ml-1.5 -mt-1.5 size-3 rounded-full bg-ink transition-opacity duration-[120ms]"
          style={{ left: `${50 + p.x * 44}%`, top: `${50 + p.y * 44}%`, opacity: on ? 1 : 0 }}
        />
      </div>
      <button
        type="button"
        onClick={tap}
        className="h-24 flex-none rounded-[24px] text-[22px] font-bold tracking-[-0.01em] text-white transition-[background,transform] duration-150 active:scale-[.98]"
        style={{ background: hit ? "#3A3A37" : "#111111" }}
      >
        {hit ? "Got it" : "I saw it"}
      </button>
      <p className="m-0 mt-3 flex-none text-center text-[13px] text-muted">
        Tap whenever a dot flashes. Don&apos;t move your eyes.<span className="hidden pointer-fine:inline"> Space works too.</span>
      </p>
    </div>
    </div>
  );
}
