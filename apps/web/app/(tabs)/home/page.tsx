"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Button } from "@/components/Button";
import { Card, SectionTitle } from "@/components/Card";
import { StatusBadge } from "@/components/Chip";
import { Icon } from "@/components/Icon";
import { ListRow } from "@/components/ListRow";
import { Screen } from "@/components/Screen";
import { TestIcon } from "@/components/TestArt";
import { daysAgo, fmtLong, fmtShort, useToday } from "@/lib/dates";
import { TEST_COPY, testInfo } from "@/lib/tests";
import { getHistory } from "@/services/sessions";

const POPULAR = ["tumbling_e", "colour_plates"] as const;

export default function Home() {
  const today = useToday();
  const history = useQuery({ queryKey: ["history"], queryFn: getHistory });
  const last = history.data?.sessions[0];

  return (
    <Screen tabs eyebrow={today ? fmtLong(today) : " "} title="Today">
      <Card dark className="flex flex-none flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="flex h-7 items-center gap-[7px] rounded-full bg-white/12 px-3 text-[13px] font-semibold">
            <span className="size-[7px] rounded-full bg-acc-bright" />
            Due today
          </span>
          <span className="text-[14px] text-white/72">About 5 min</span>
        </div>
        <h2 className="m-0 mt-2.5 text-[24px] font-bold leading-[1.2] tracking-[-0.02em]">Time for your eye check</h2>
        <p className="m-0 text-[15px] leading-[1.45] text-white/75">Sharpness, focus, colour and contrast.</p>
        <Button href="/check/intake" variant="inverted" arrow className="mt-3.5">
          Start eye check
        </Button>
      </Card>

      <Link
        href="/check/quick"
        className="flex min-h-[62px] flex-none items-center gap-3 rounded-[20px] border border-line bg-white py-2.5 pl-3.5 pr-3 transition-[transform,border-color] duration-150 hover:border-[#D6D6D1] active:scale-[.98]"
      >
        <span className="grid size-[38px] flex-none place-items-center rounded-full bg-acc-soft text-acc-ink">
          <Icon name="bolt" size={20} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-px">
          <span className="text-[16px] font-semibold">1-minute quick check</span>
          <span className="text-[13px] text-muted">Tumbling E · Amsler · Clock dial</span>
        </span>
        <span className="grid h-9 flex-none place-items-center rounded-full bg-ink px-3.5 text-[14px] font-semibold text-white">Start</span>
      </Link>

      <Card href={last ? `/results/${last.id}` : "/results"} className="flex flex-none items-end justify-between gap-3">
        <span className="flex flex-col">
          <span className="text-[14px] font-semibold text-muted">Last eye check</span>
          <span className="mt-2.5 text-[26px] font-bold leading-[1.1] tracking-[-0.02em]">{last ? fmtShort(last.date) : history.isPending ? "…" : "None yet"}</span>
          <span className="mt-1 text-[13px] text-muted">{last && today ? daysAgo(last.date, today) : "Take your first check"}</span>
        </span>
        {last && <StatusBadge status={last.status} label={last.status === "good" ? "All clear" : undefined} className="self-end" />}
      </Card>

      <div className="flex flex-none flex-col gap-2.5">
        <SectionTitle title="Popular tests" action="See all" href="/tests" />
        <Card flush>
          {POPULAR.map((id, i) => (
            <ListRow key={id} first={i === 0} href={`/tests/${id}`} icon={<TestIcon id={id} />} title={TEST_COPY[id].title} right={`${testInfo(id).minutes} min`} />
          ))}
        </Card>
      </div>
    </Screen>
  );
}
