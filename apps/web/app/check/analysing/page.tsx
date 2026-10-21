"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CheckGuard } from "@/components/CheckGuard";
import { cn } from "@/components/cn";
import { Icon } from "@/components/Icon";
import { ErrorState } from "@/components/States";
import { getVerdict } from "@/services/sessions";
import { useCheck } from "@/store/check";

const STEPS = ["Checking clarity", "Checking focus", "Checking eye health", "Comparing with past checks"];

export default function Analysing() {
  return (
    <CheckGuard>
      <AnalysingScreen />
    </CheckGuard>
  );
}

function AnalysingScreen() {
  const router = useRouter();
  const sessionId = useCheck((s) => s.sessionId)!;
  const verdict = useQuery({ queryKey: ["verdict", sessionId], queryFn: () => getVerdict(sessionId), staleTime: Infinity });
  const [tick, setTick] = useState(0);
  const ready = tick >= STEPS.length && verdict.isSuccess;

  useEffect(() => {
    if (tick >= STEPS.length) return;
    const t = setTimeout(() => setTick(tick + 1), 900);
    return () => clearTimeout(t);
  }, [tick]);

  useEffect(() => {
    if (!ready) return;
    useCheck.getState().setVerdict(verdict.data);
    const t = setTimeout(() => router.replace(`/results/${sessionId}`), 700);
    return () => clearTimeout(t);
  }, [ready, verdict.data, router, sessionId]);

  if (verdict.isError) return <ErrorState body="We couldn't prepare your results. Your answers are saved." onRetry={() => verdict.refetch()} retrying={verdict.isFetching} />;

  const pct = Math.min(100, tick * 25);
  return (
    <main className="flex h-full flex-col items-center bg-pearl px-6 pb-10 pt-6">
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center">
        <div className="relative size-[168px]">
          <svg width="168" height="168" viewBox="0 0 168 168" className="block -rotate-90">
            <circle cx="84" cy="84" r="70" fill="none" stroke="#ECECE8" strokeWidth="8" />
            <circle
              cx="84"
              cy="84"
              r="70"
              fill="none"
              stroke="#3C7EBE"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="439.8"
              strokeDashoffset={439.8 * (1 - pct / 100)}
              style={{ transition: "stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-[36px] font-bold leading-none tracking-[-0.03em] tabular-nums" role="status" aria-label={`${pct}% done`}>
            {pct}%
          </div>
        </div>
        <h1 className="m-0 mt-8 text-center text-[26px] font-bold leading-[1.2] tracking-[-0.025em]">{ready ? "Your results are ready" : "Analysing your answers"}</h1>
        <p className="m-0 mt-2 max-w-[290px] text-center text-[16px] leading-normal text-muted text-pretty">Comparing both eyes with your past checks.</p>
        <div className="mt-8 flex w-full max-w-[280px] flex-col gap-4">
          {STEPS.map((label, i) => {
            const done = i < tick;
            const active = i === tick;
            return (
              <div key={label} className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-6 flex-none place-items-center rounded-full border-2 transition-colors duration-300",
                    done ? "border-ink bg-ink" : active ? "border-ink" : "border-[#D6D6D1]",
                  )}
                >
                  {done && <Icon name="check" size={12} color="#fff" strokeWidth={2.4} />}
                  {active && <span className="size-2 rounded-full bg-acc" />}
                </span>
                <span className={cn("text-[16px] transition-colors duration-300", active ? "font-bold" : "font-medium", done || active ? "text-ink" : "text-faint")}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-none items-center gap-2 text-[13px] text-muted">
        <Icon name="lock" size={16} strokeWidth={1.7} />
        <span>Preparing your results…</span>
      </div>
    </main>
  );
}
