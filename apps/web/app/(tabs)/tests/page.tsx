"use client";

import { TEST_CATALOG } from "@visus/shared";
import Link from "next/link";
import { useState } from "react";

import { Card } from "@/components/Card";
import { cn } from "@/components/cn";
import { applyFilters, FilterSheet, hasFilters, NO_FILTERS, type Filters } from "@/components/FilterSheet";
import { Icon } from "@/components/Icon";
import { ListRow } from "@/components/ListRow";
import { Screen } from "@/components/Screen";
import { HeaderButton } from "@/components/ScreenHeader";
import { CATEGORIES, librarySub, TEST_COPY } from "@/lib/tests";

export default function Tests() {
  const [sel, setSel] = useState(0);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [sheet, setSheet] = useState(false);
  const cat = CATEGORIES[sel];
  const filtered = hasFilters(filters);
  const tests = filtered ? applyFilters(filters) : TEST_CATALOG.filter((t) => t.category === cat.id);

  return (
    <>
      <Screen
        tabs
        gap="gap-5"
        eyebrow={`${TEST_CATALOG.length} tests in ${CATEGORIES.length} groups`}
        title="Tests"
        actions={
          <>
            <Link href="/tests/search" aria-label="Search tests" title="Search tests" className="grid size-11 place-items-center rounded-full bg-pill transition-transform hover:bg-[#E3E3DF] active:scale-[.94]">
              <Icon name="search" size={19} />
            </Link>
            <span className="relative">
              <HeaderButton icon="filter" label="Filter tests" onClick={() => setSheet(true)} />
              {filtered && <span className="absolute right-0.5 top-0.5 size-2.5 rounded-full border-2 border-pearl bg-acc" />}
            </span>
          </>
        }
      >
        <div className="grid flex-none grid-cols-3 gap-2.5" role="tablist" aria-label="Test groups">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={!filtered && i === sel}
              onClick={() => {
                setSel(i);
                setFilters(NO_FILTERS);
              }}
              className={cn(
                "flex h-20 flex-col items-center justify-center gap-1.5 rounded-[18px] border text-[14px] font-semibold transition-[background,color,border-color,transform] duration-200 active:scale-[.97]",
                !filtered && i === sel ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-[#D6D6D1]",
              )}
            >
              {c.icon === "E" ? <span className="grid h-6 place-items-center text-[21px] font-bold leading-none">E</span> : <Icon name={c.icon} size={24} />}
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        <section className="mt-1 flex flex-none flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="m-0 text-[22px] font-bold leading-[1.2] tracking-[-0.02em]">{filtered ? "Filtered" : cat.name}</h2>
              <span className="flex-none text-[14px] text-muted">{tests.length === 1 ? "1 test" : `${tests.length} tests`}</span>
            </div>
            {filtered ? (
              <button type="button" onClick={() => setFilters(NO_FILTERS)} className="self-start text-[16px] font-semibold text-acc-ink hover:underline">
                Clear filters
              </button>
            ) : (
              <p className="m-0 text-[16px] leading-[1.45] text-muted text-pretty">{cat.question}</p>
            )}
          </div>
          <Card flush>
            {tests.map((t, i) => (
              <ListRow key={t.id} first={i === 0} href={`/tests/${t.id}`} icon={i + 1} accent title={TEST_COPY[t.id].title} subtitle={librarySub(t)} className="min-h-[66px]" />
            ))}
          </Card>
          <Link href="/check/glasses" className="flex min-h-[66px] items-center gap-3.5 rounded-[20px] bg-acc-soft px-4 py-2.5 transition-transform active:scale-[.98]">
            <span className="grid size-[38px] flex-none place-items-center rounded-full bg-white text-acc-ink">
              <Icon name="glasses" size={20} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[16px] font-semibold">Glasses check</span>
              <span className="text-[13px] text-acc-ink">Are your glasses still right? · 3 min</span>
            </span>
            <Icon name="chevronRight" size={16} color="#194F81" strokeWidth={2.2} />
          </Link>
        </section>
      </Screen>
      {sheet && <FilterSheet value={filters} onChange={setFilters} onClose={() => setSheet(false)} />}
    </>
  );
}
