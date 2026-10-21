"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/Button";
import { cn } from "@/components/cn";
import { Icon } from "@/components/Icon";
import { Screen, Spacer } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ErrorState, LoadingState } from "@/components/States";
import { useVerdict } from "@/lib/useVerdict";

export default function Lens() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const q = useVerdict(sessionId);
  const [saved, setSaved] = useState(false);

  if (q.isPending) return <LoadingState />;
  if (q.isError) return <ErrorState onRetry={() => q.refetch()} retrying={q.isFetching} />;
  const [best, ...others] = q.data.lens;
  if (!best) return <ErrorState title="No lens suggestions" body="This check didn't need a lens suggestion." />;

  return (
    <Screen gap="gap-0">
      <ScreenHeader title="Lens suggestions" fallback={`/results/${sessionId}`} />
      <span className="mt-5 text-[14px] font-semibold text-muted">Based on today&apos;s check</span>
      <h1 className="m-0 mt-1 text-[28px] font-bold leading-[1.15] tracking-[-0.025em]">Lenses that suit you</h1>

      {[best, ...others].map((l, i) => (
        <div key={l.product} className={cn("mt-4 flex flex-none flex-col gap-2.5 rounded-[22px] border bg-white p-4", i === 0 ? "border-ink" : "border-line")}>
          <div className="flex items-center justify-between gap-2.5">
            <span className={cn("flex h-6 items-center rounded-full px-2.5 text-[12px] font-semibold", i === 0 ? "bg-ink text-white" : "bg-pill text-ink-soft")}>
              {i === 0 ? "Best match" : "Also suits you"}
            </span>
            <span className="text-[13px] text-muted">{l.lensType}</span>
          </div>
          <span className="text-[21px] font-bold tracking-[-0.015em]">{l.product}</span>
          <div className={cn("flex flex-col gap-[3px] rounded-[14px] p-3", i === 0 ? "bg-acc-soft" : "bg-fill")}>
            <span className={cn("text-[13px] font-bold", i === 0 ? "text-acc-ink" : "text-ink-soft")}>Why this suits you</span>
            <span className="text-[15px] leading-[1.45] text-ink-soft text-pretty">{l.reason}</span>
          </div>
        </div>
      ))}

      {best.coatings.length > 0 && (
        <>
          <h3 className="m-0 mt-5 text-[17px] font-bold">Coatings</h3>
          <div className="mt-2.5 flex flex-none flex-col overflow-hidden rounded-[20px] border border-line bg-white">
            {best.coatings.map((c, i) => (
              <div key={c.name} className={cn("flex min-h-[74px] items-center gap-3.5 px-4 py-3", i > 0 && "border-t border-divider")}>
                <span className="grid size-10 flex-none place-items-center rounded-full bg-fill">
                  <Icon name={/blue/i.test(c.name) ? "comfort" : "shield"} size={20} strokeWidth={1.9} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[16px] font-semibold">{c.name}</span>
                  <span className="text-[13px] leading-[1.35] text-muted text-pretty">{c.reason}</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="m-0 mt-3 text-[13px] leading-[1.45] text-muted text-pretty">Your optician will confirm the final prescription and lens.</p>

      <Spacer />
      <div className="flex flex-none gap-2.5">
        <button
          type="button"
          onClick={() => setSaved(!saved)}
          aria-pressed={saved}
          className={cn("flex h-btn flex-none items-center gap-2 rounded-[16px] border bg-white px-[18px] text-[16px] font-semibold transition-[border-color] hover:bg-card-hover", saved ? "border-ink" : "border-line-strong")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? "#111" : "none"} stroke="#111" strokeWidth="2" strokeLinejoin="round">
            <path d="M6.5 3.5h11v17L12 16.5l-5.5 4z" />
          </svg>
          {saved ? "Saved" : "Save"}
        </button>
        <Button href={`/results/${sessionId}/share`} className="flex-1">
          Show at store
        </Button>
      </div>
    </Screen>
  );
}
