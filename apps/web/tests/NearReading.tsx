"use client";

import { useState } from "react";

import { Segmented } from "@/components/Chip";
import { cn } from "@/components/cn";

import { TestFrame } from "./TestFrame";
import type { TestProps } from "./types";

const LINES = ["N36", "N24", "N18", "N14", "N12", "N10", "N8", "N6"];
/** N-point print size: N1 = 1 typographic point = 0.3528 mm of font size. */
const N_MM = 0.3528;
const TEXT: Record<string, string[]> = {
  EN: ["Sun is up", "Birds sing at dawn", "We walk to the market", "Mother cooks rice for lunch", "The train leaves at nine today", "Children play in the park after school", "Drink clean water and rest your eyes often", "Regular eye checks help you see clearly for years"],
  HI: ["सूरज निकला", "सुबह पक्षी गाते हैं", "हम बाज़ार जाते हैं", "माँ दोपहर का खाना बनाती है", "रेलगाड़ी नौ बजे चलती है", "बच्चे स्कूल के बाद पार्क में खेलते हैं", "साफ़ पानी पिएँ और आँखों को आराम दें", "नियमित आँखों की जाँच से आप सालों तक साफ़ देखते हैं"],
  OR: ["ସୂର୍ଯ୍ୟ ଉଠିଲା", "ସକାଳେ ପକ୍ଷୀ ଗାନ କରନ୍ତି", "ଆମେ ବଜାରକୁ ଯାଉଛୁ", "ମା ମଧ୍ୟାହ୍ନ ଭୋଜନ ରାନ୍ଧନ୍ତି", "ଟ୍ରେନ ନଅଟାରେ ଛାଡ଼େ", "ପିଲାମାନେ ସ୍କୁଲ ପରେ ପାର୍କରେ ଖେଳନ୍ତି", "ସଫା ପାଣି ପିଅନ୍ତୁ ଓ ଆଖିକୁ ବିଶ୍ରାମ ଦିଅନ୍ତୁ", "ନିୟମିତ ଆଖି ପରୀକ୍ଷା ଆପଣଙ୍କୁ ସ୍ପଷ୍ଟ ଦେଖିବାରେ ସାହାଯ୍ୟ କରେ"],
};
const LANGS = [
  ["EN", "EN"],
  ["HI", "हिं"],
  ["OR", "ଓଡ଼ିଆ"],
] as const;
const FONT = "var(--font-figtree), var(--font-deva), var(--font-oriya), sans-serif";

/** Screen 27. Tap the smallest line you can read; sizes are physical (pxPerMm). */
export function NearReading({ eye, pxPerMm, onDone, onExit, onPause }: TestProps) {
  const [lang, setLang] = useState(0);
  const [sel, setSel] = useState<number | null>(null);

  return (
    <TestFrame title="Near reading" eye={eye} progress="Hold at 40 cm" onExit={onExit} onPause={onPause}>
      <Segmented pill className="mt-3.5 h-10 flex-none [&_button]:[font-family:var(--font-figtree),var(--font-deva),var(--font-oriya)]" options={LANGS.map((l) => l[1])} value={lang} onChange={setLang} />
      <div className="no-scrollbar mt-3.5 flex min-h-0 flex-1 flex-col overflow-y-auto rounded-[20px] border border-line bg-white">
        {LINES.map((label, i) => {
          const on = sel === i;
          const n = Number(label.slice(1));
          return (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              onClick={() => setSel(on ? null : i)}
              className={cn("grid min-h-11 flex-none grid-cols-[36px_minmax(0,1fr)] items-center gap-2.5 px-3.5 py-1.5 text-left transition-colors", i > 0 && "border-t border-divider", on ? "bg-acc-soft shadow-[inset_0_0_0_1.5px_#111111]" : "hover:bg-card-hover")}
            >
              <span className={cn("text-[11px] font-bold tabular-nums", on ? "text-ink" : "text-[#8A8A85]")}>{label}</span>
              <span className="font-medium leading-[1.3] text-balance" style={{ fontSize: n * N_MM * pxPerMm, fontFamily: FONT }}>
                {TEXT[LANGS[lang][0]][i]}
              </span>
            </button>
          );
        })}
      </div>
      <p className="m-0 mt-3 flex-none text-center text-[15px] font-semibold text-ink-soft">{sel == null ? "Tap the smallest line you can read clearly." : `Smallest clear line: ${LINES[sel]}`}</p>
      <button
        type="button"
        disabled={sel == null}
        onClick={() => onDone({ smallestLine: LINES[sel!], language: LANGS[lang][0], distanceMm: 400, pxPerMm })}
        className="mt-3 h-btn flex-none rounded-[16px] bg-ink text-btn font-semibold text-white transition-opacity active:scale-[.98] disabled:opacity-35"
      >
        {sel == null ? "Confirm" : `Confirm ${LINES[sel]}`}
      </button>
    </TestFrame>
  );
}
