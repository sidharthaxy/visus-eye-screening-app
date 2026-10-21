"use client";

import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Screen, Spacer } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useStartCheck } from "@/lib/useStartCheck";

const Specs = ({ off, color }: { off?: boolean; color: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6.5" cy="14" r="3.5" />
    <circle cx="17.5" cy="14" r="3.5" />
    <path d="M10 14h4M3 14l1.5-6M21 14l-1.5-6" />
    {off && <path d="M3 3.5l18 17" />}
  </svg>
);

/** Screen 60. */
export default function GlassesCheck() {
  const start = useStartCheck();
  const rounds = [
    ["ROUND 1", "Glasses off", "Take them off and keep them close by.", <Specs key="off" off color="#111" />, "bg-pressed"],
    ["ROUND 2", "Glasses on", "Put them back on when we ask.", <Specs key="on" color="#fff" />, "bg-ink"],
  ] as const;

  return (
    <Screen white gap="gap-0">
      <ScreenHeader left="close" title="Glasses check" fallback="/tests" />
      <h1 className="m-0 mt-[22px] text-[30px] font-bold leading-[1.15] tracking-[-0.025em] text-balance">Are your glasses still right?</h1>
      <p className="m-0 mt-2 text-[16px] leading-normal text-muted text-pretty">We&apos;ll run a short sharpness test twice and compare.</p>
      <div className="mt-6 flex flex-none flex-col gap-3">
        {rounds.map(([k, title, sub, icon, bg]) => (
          <div key={k} className="flex items-center gap-3.5 rounded-[20px] border border-line p-4">
            <span className={`grid size-14 flex-none place-items-center rounded-full ${bg}`}>{icon}</span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[12px] font-bold tracking-[.06em] text-[#8A8A85]">{k}</span>
              <span className="text-[18px] font-bold">{title}</span>
              <span className="text-[14px] leading-[1.4] text-muted">{sub}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-[18px] flex flex-none items-center gap-2.5 text-[15px] text-ink-soft">
        <Icon name="clock" size={20} strokeWidth={1.9} className="flex-none" />
        <span>About 3 minutes · one eye at a time</span>
      </div>
      <Spacer />
      {start.isError && <p className="m-0 mb-3 text-center text-[14px] text-doc">Couldn&apos;t start. Try again.</p>}
      <Button disabled={start.isPending} onClick={() => start.mutate({ mode: "glasses", intake: "Glasses check" })}>
        {start.isPending ? "Starting…" : "Start"}
      </Button>
    </Screen>
  );
}
