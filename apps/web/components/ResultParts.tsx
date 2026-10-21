import type { ScoredResult, Status } from "@visus/shared";

import { perEye } from "@/lib/results";

import { StatusBadge } from "./Chip";
import { cn } from "./cn";

export function BigScore({ score }: { score: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[52px] font-bold leading-none tracking-[-0.04em]">{score}</span>
      <span className="text-[16px] text-muted">/ 100</span>
    </div>
  );
}

/** "Left vs right" rows when the server summary has both eyes, else nothing. */
export function EyeCompare({ result, cards }: { result: ScoredResult; cards?: boolean }) {
  const eyes = perEye(result.summary);
  if (!eyes) return null;
  const rows = [
    ["Left eye", eyes.left],
    ["Right eye", eyes.right],
  ];
  return (
    <>
      <h3 className="m-0 mt-[22px] text-[17px] font-bold">Left vs right</h3>
      {cards ? (
        <div className="mt-2.5 grid flex-none grid-cols-2 gap-2.5">
          {rows.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-2 rounded-[20px] border border-line bg-white p-3.5">
              <span className="text-[14px] font-semibold text-muted">{k}</span>
              <span className="text-[26px] font-bold leading-[1.1] tracking-[-0.03em]">{v}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2.5 flex-none rounded-[20px] border border-line bg-white px-4 py-1">
          {rows.map(([k, v], i) => (
            <div key={k} className={cn("flex items-baseline justify-between gap-3 py-3.5", i > 0 && "border-t border-divider")}>
              <span className="text-[15px] font-semibold">{k}</span>
              <span className="text-[15px] font-bold">{v}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export const TIPS: Record<Status, string> = {
  good: "Nothing to do for now. A quick re-check every few months keeps your record up to date.",
  mild: "Mention this at your next eye test. A small lens update often fixes it.",
  see_doctor: "Book an eye doctor soon and show them this result.",
};

export function ScoreRow({ result }: { result: ScoredResult }) {
  return (
    <div className="mt-3.5 flex flex-none items-end justify-between gap-3">
      <BigScore score={result.score} />
      <StatusBadge status={result.status} className="mb-1 self-end" />
    </div>
  );
}
