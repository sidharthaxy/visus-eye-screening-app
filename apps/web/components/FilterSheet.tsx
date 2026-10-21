"use client";

import { TEST_CATALOG, type TestInfo } from "@visus/shared";

import { PROBLEMS, TEST_PROBLEMS, type Problem } from "@/lib/tests";

import { Button } from "./Button";
import { Chip, Segmented } from "./Chip";
import { cn } from "./cn";

export type Filters = { problems: Problem[]; age: number; type: number; time: number };
export const NO_FILTERS: Filters = { problems: [], age: 0, type: 0, time: 0 };

export const hasFilters = (f: Filters) => f.problems.length > 0 || f.age > 0 || f.type > 0 || f.time > 0;

export function applyFilters(f: Filters): TestInfo[] {
  return TEST_CATALOG.filter(
    (t) =>
      (!f.problems.length || TEST_PROBLEMS[t.id].some((p) => f.problems.includes(p))) &&
      (f.age === 0 || (f.age === 1 ? t.category !== "kids" : t.category === "kids")) &&
      (f.type === 0 || (f.type === 1 ? t.kind === "visual" : t.kind === "questionnaire")) &&
      (f.time === 0 || t.minutes <= (f.time === 1 ? 2 : 3)),
  );
}

const Group = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-2.5">
    <span className="text-[14px] font-bold text-muted">{label}</span>
    {children}
  </div>
);

/** Screen 52: bottom sheet over the Tests tab. */
export function FilterSheet({ value, onChange, onClose }: { value: Filters; onChange: (f: Filters) => void; onClose: () => void }) {
  const n = applyFilters(value).length;
  const toggle = (p: Problem) => onChange({ ...value, problems: value.problems.includes(p) ? value.problems.filter((x) => x !== p) : [...value.problems, p] });

  return (
    <>
      <div className="absolute inset-0 z-20 bg-[rgba(17,17,17,.42)]" onClick={onClose} />
      <div role="dialog" aria-modal aria-label="Filters" className="absolute inset-x-0 bottom-0 z-30 flex max-h-[92%] flex-col overflow-y-auto rounded-t-[28px] bg-white px-5 pb-[34px] pt-2.5 shadow-[0_-10px_30px_rgba(0,0,0,.12)]">
        <span className="h-[5px] w-9 flex-none self-center rounded-full bg-line-strong" />
        <div className="mt-3 flex h-11 flex-none items-center justify-between">
          <span className="text-[22px] font-bold tracking-[-0.015em]">Filters</span>
          <button type="button" onClick={() => onChange(NO_FILTERS)} className={cn("h-11 px-1 text-[15px] font-semibold transition-opacity", !hasFilters(value) && "opacity-35")}>
            Clear
          </button>
        </div>
        <div className="mt-3 flex flex-col gap-5">
          <Group label="Problem">
            <div className="flex flex-wrap gap-2">
              {PROBLEMS.map(([k, label]) => (
                <Chip key={k} compact label={label} selected={value.problems.includes(k)} onClick={() => toggle(k)} />
              ))}
            </div>
          </Group>
          <Group label="Age">
            <Segmented pill className="h-11" options={["All ages", "Adults", "Kids"]} value={value.age} onChange={(age) => onChange({ ...value, age })} />
          </Group>
          <Group label="Type">
            <Segmented pill className="h-11" options={["Any", "Interactive", "Questionnaire"]} value={value.type} onChange={(type) => onChange({ ...value, type })} />
          </Group>
          <Group label="Time">
            <Segmented pill className="h-11" options={["Any", "Up to 2 min", "Up to 3 min"]} value={value.time} onChange={(time) => onChange({ ...value, time })} />
          </Group>
        </div>
        <Button className="mt-[26px] flex-none" disabled={!n} onClick={onClose}>
          {n ? `Show ${n} ${n === 1 ? "test" : "tests"}` : "No tests match"}
        </Button>
      </div>
    </>
  );
}
