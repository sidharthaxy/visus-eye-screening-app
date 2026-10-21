"use client";

import type { Category } from "@visus/shared";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { STATUS } from "@/components/Chip";
import { cn } from "@/components/cn";
import { Icon } from "@/components/Icon";
import { Screen, Spacer } from "@/components/Screen";
import { HeaderButton, ScreenHeader } from "@/components/ScreenHeader";
import { ErrorState, LoadingState } from "@/components/States";
import { TestIcon } from "@/components/TestArt";
import { CATEGORIES, TEST_COPY, testInfo } from "@/lib/tests";
import { useVerdict } from "@/lib/useVerdict";
import { useCheck } from "@/store/check";

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const q = useVerdict(sessionId);
  const check = useCheck();

  if (q.isPending) return <LoadingState />;
  if (q.isError) return <ErrorState onRetry={() => q.refetch()} retrying={q.isFetching} />;

  const v = q.data;
  const isCurrent = check.sessionId === sessionId && check.startedAt > 0;
  const minutes = v.results.reduce((n, r) => n + testInfo(r.testId).minutes, 0);
  const areas = CATEGORIES.filter((c) => v.areas[c.id]);
  const findings = v.results.filter((r) => r.status !== "good");

  return (
    <Screen gap="gap-0">
      <ScreenHeader
        left="close"
        title="Your results"
        onLeft={() => router.push("/home")}
        right={<HeaderButton icon="share" label="Share report" onClick={() => router.push(`/results/${sessionId}/share`)} />}
      />

      <div className="mt-4 flex flex-none flex-col gap-1 rounded-[24px] bg-night px-5 py-[18px] text-white">
        <span className="text-[13px] font-semibold text-white/70">
          {isCurrent ? "Today · " : ""}
          {v.results.length} {v.results.length === 1 ? "test" : "tests"}
          {` · ${minutes} min`}
        </span>
        <h2 className="m-0 mt-1 text-[24px] font-bold leading-[1.2] tracking-[-0.02em]">{v.headline}</h2>
        <p className="m-0 mt-0.5 text-[15px] leading-[1.45] text-white/75">{v.advice}</p>
      </div>

      <div className="mt-3 grid flex-none grid-cols-2 gap-2.5">
        {areas.map((c) => {
          const s = v.areas[c.id as Category]!;
          return (
            <div key={c.id} className={cn("flex flex-col gap-1.5 rounded-[18px] border bg-white px-3.5 py-3", s === "see_doctor" ? "border-[#F2D3CE]" : "border-line")}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[15px] font-bold">{c.label}</span>
                <span className={cn("size-2 rounded-full", STATUS[s].dot)} />
              </div>
              <span className={cn("text-[13px]", s === "see_doctor" ? "font-semibold text-doc" : "text-muted")}>{STATUS[s].label}</span>
            </div>
          );
        })}
      </div>

      <h3 className="m-0 mt-5 text-[18px] font-bold tracking-[-0.01em]">Findings</h3>
      <div className="mt-2.5 flex flex-none flex-col gap-2.5">
        {findings.length === 0 && <p className="m-0 text-[15px] text-muted">Nothing stood out. Everything looked as expected.</p>}
        {findings.map((r) => (
          <Link
            key={r.testId}
            href={`/results/${sessionId}/${r.testId}`}
            className="flex min-h-[72px] items-center gap-3.5 rounded-[20px] border border-line bg-white px-4 py-3 transition-[border-color,transform] duration-150 hover:border-[#D6D6D1] active:scale-[.98]"
          >
            <span className={cn("grid size-10 flex-none place-items-center rounded-full text-[18px] font-bold", STATUS[r.status].bg, STATUS[r.status].fg)}>
              <TestIcon id={r.testId} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[16px] font-semibold">{r.summary}</span>
              <span className="text-[13px] text-muted">
                {TEST_COPY[r.testId].title} · {STATUS[r.status].label}
              </span>
            </span>
            <Icon name="chevronRight" size={16} color="#9A9A95" strokeWidth={2.2} />
          </Link>
        ))}
      </div>

      {v.lens.length > 0 && (
        <Link
          href={`/results/${sessionId}/lens`}
          className="mt-3 flex min-h-[72px] flex-none items-center gap-3.5 rounded-[20px] bg-acc-soft px-4 py-3 transition-transform active:scale-[.98]"
        >
          <span className="grid size-10 flex-none place-items-center rounded-full bg-white text-acc-ink">
            <Icon name="glasses" size={20} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[16px] font-semibold">Lenses that suit you</span>
            <span className="text-[13px] text-acc-ink">
              {v.lens[0].product}
              {v.lens.length > 1 ? ` and ${v.lens.length - 1} more` : ""}
            </span>
          </span>
          <Icon name="chevronRight" size={16} color="#194F81" strokeWidth={2.2} />
        </Link>
      )}

      <Spacer min={12} />
      <div className="mb-3 flex flex-none items-center justify-center gap-2 text-[13px] text-muted">
        <Icon name="info" size={16} />
        <span>Screening, not diagnosis.</span>
      </div>
      <Button href="/home">Done</Button>
    </Screen>
  );
}
