"use client";

import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Pill } from "@/components/Chip";
import { Screen, Spacer } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { EGlyph } from "@/tests/TumblingE";
import { useStartCheck } from "@/lib/useStartCheck";

const ITEMS = [
  [
    "Tumbling E",
    "Sharpness",
    <EGlyph key="e" size={24} dir="right" />,
  ],
  [
    "Amsler grid",
    "Central vision",
    <svg key="a" width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#111" strokeWidth="1.4">
      <rect x="1" y="1" width="26" height="26" />
      <path d="M7.5 1v26M14 1v26M20.5 1v26M1 7.5h26M1 14h26M1 20.5h26" />
      <circle cx="14" cy="14" r="2.2" fill="#111" stroke="none" />
    </svg>,
  ],
  [
    "Clock dial",
    "Astigmatism",
    <svg key="c" width="28" height="28" viewBox="0 0 26 26" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round">
      <path d="M13 3v6M13 17v6M3 13h6M17 13h6M5.9 5.9l4.2 4.2M15.9 15.9l4.2 4.2M20.1 5.9l-4.2 4.2M10.1 15.9l-4.2 4.2" />
    </svg>,
  ],
] as const;

/** Screen 59. */
export default function Quick() {
  const start = useStartCheck();
  return (
    <Screen white gap="gap-0">
      <ScreenHeader left="close" title="Quick check" fallback="/home" />
      <Pill className="mt-[22px]" label="1 minute" leading={<Icon name="clock" size={15} strokeWidth={2.2} />} />
      <h1 className="m-0 mt-3 text-[30px] font-bold leading-[1.15] tracking-[-0.025em]">1-minute check</h1>
      <p className="m-0 mt-2 text-[16px] leading-normal text-muted text-pretty">Three fast tests for a quick read on your eyes.</p>
      <div className="mt-6 flex flex-none flex-col border-b border-line">
        {ITEMS.map(([name, sub, art]) => (
          <div key={name} className="flex min-h-[84px] items-center gap-4 border-t border-line">
            <span className="grid size-14 flex-none place-items-center rounded-[16px] border border-line">{art}</span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[17px] font-bold">{name}</span>
              <span className="text-[14px] text-muted">{sub}</span>
            </span>
            <span className="text-[14px] font-semibold text-muted">20 sec</span>
          </div>
        ))}
      </div>
      <div className="mt-[18px] flex flex-none items-center gap-2.5 text-[15px] leading-[1.4] text-ink-soft">
        <Icon name="glasses" size={20} strokeWidth={1.9} className="flex-none" />
        <span>Keep your glasses on. Hold the screen about 40 cm away.</span>
      </div>
      <Spacer />
      {start.isError && <p className="m-0 mb-3 text-center text-[14px] text-doc">Couldn&apos;t start. Try again.</p>}
      <Button disabled={start.isPending} onClick={() => start.mutate({ mode: "quick", intake: "Quick check" })}>
        {start.isPending ? "Starting…" : "Start"}
      </Button>
    </Screen>
  );
}
