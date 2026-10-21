"use client";

import { TEST_CATALOG } from "@visus/shared";
import Link from "next/link";
import { useState } from "react";

import { Card } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { ListRow } from "@/components/ListRow";
import { Screen } from "@/components/Screen";
import { HeaderButton } from "@/components/ScreenHeader";
import { useBack } from "@/components/nav";
import { categoryOf, librarySub, PROBLEM_WORDS, TEST_COPY, TEST_PROBLEMS } from "@/lib/tests";

const POPULAR = ["tumbling_e", "colour_plates", "amsler", "eye_strain"];

export default function Search() {
  const back = useBack("/tests");
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const results = query
    ? TEST_CATALOG.filter((t) =>
        [TEST_COPY[t.id].title, categoryOf(t.category).label, ...TEST_PROBLEMS[t.id].map((p) => PROBLEM_WORDS[p])].join(" ").toLowerCase().includes(query),
      )
    : TEST_CATALOG.filter((t) => POPULAR.includes(t.id));

  return (
    <Screen gap="gap-0">
      <div className="grid flex-none grid-cols-[44px_minmax(0,1fr)] items-center gap-2.5">
        <HeaderButton icon="chevronLeft" label="Back" onClick={back} />
        <div className="relative h-12">
          <Icon name="search" size={20} color="#5F5F5B" className="pointer-events-none absolute left-3.5 top-3.5" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tests or symptoms"
            aria-label="Search tests"
            className="h-12 w-full rounded-full border border-ink bg-white pl-[42px] pr-11 text-[16px] shadow-[0_0_0_4px_rgba(17,17,17,.06)] outline-none focus-visible:outline-none"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="absolute right-0.5 top-0.5 grid size-11 place-items-center rounded-full">
              <span className="grid size-5 place-items-center rounded-full bg-radio">
                <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </span>
            </button>
          )}
        </div>
      </div>

      {results.length > 0 ? (
        <>
          <span className="ml-1 mt-[22px] text-[14px] font-semibold text-muted" aria-live="polite">
            {query ? `${results.length} ${results.length === 1 ? "test" : "tests"} for “${q.trim()}”` : "Popular tests"}
          </span>
          <Card flush className="mt-2.5 flex-none">
            {results.slice(0, 8).map((t, i) => {
              const name = TEST_COPY[t.id].title;
              const at = query ? name.toLowerCase().indexOf(query) : -1;
              return (
                <ListRow
                  key={t.id}
                  first={i === 0}
                  href={`/tests/${t.id}`}
                  icon={i + 1}
                  accent
                  className="min-h-[66px]"
                  title={
                    at < 0 ? (
                      name
                    ) : (
                      <>
                        {name.slice(0, at)}
                        <mark className="rounded-[4px] bg-acc-soft text-inherit">{name.slice(at, at + query.length)}</mark>
                        {name.slice(at + query.length)}
                      </>
                    )
                  }
                  subtitle={`${categoryOf(t.category).label} · ${librarySub(t)}`}
                />
              );
            })}
          </Card>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center pb-10 text-center">
          <span className="grid size-[72px] place-items-center rounded-full bg-pill">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4.5 4.5M8.5 11h5" />
            </svg>
          </span>
          <h2 className="m-0 mt-[18px] text-[22px] font-bold tracking-[-0.015em]">No tests found</h2>
          <p className="m-0 mt-2 max-w-[290px] text-[16px] leading-normal text-muted text-pretty">Nothing matches “{q.trim()}”. Try a word like blurry, colour or night.</p>
          <Link href="/tests" className="mt-[22px] flex h-12 items-center rounded-full border border-line-strong bg-white px-5 text-[15px] font-semibold hover:bg-[#FBFBF9]">
            Browse all tests
          </Link>
        </div>
      )}
    </Screen>
  );
}
