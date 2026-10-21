"use client";

import { useEffect, useRef, useState } from "react";

import { HeaderButton } from "@/components/ScreenHeader";
import { cn } from "@/components/cn";

import type { TestProps } from "./types";

type QuizDef = {
  title: string;
  questions: [string, string?][];
  options: string[];
  /** Fixed help line under every question (eye strain). */
  help?: string;
  /** Frequency meter on each option (Never → Always). */
  meter?: boolean;
  night?: boolean;
};

const RISK: QuizDef = {
  title: "Eye risk screener",
  questions: [
    ["Has anyone in your family had glaucoma?", "It often runs in families."],
    ["Do you have diabetes?", "Diabetes can affect the tiny blood vessels in your eyes."],
    ["Do you have high blood pressure?", "It can strain the blood vessels at the back of the eye."],
    ["Have you ever had an eye injury or surgery?", "Including laser treatment or cataract surgery."],
    ["Do you smoke?", "Smoking raises the risk of several eye conditions."],
  ],
  options: ["Yes", "No", "Not sure"],
};

const FREQ = ["Never", "Sometimes", "Often", "Always"];

const STRAIN: QuizDef = {
  title: "Eye strain",
  questions: [
    ["Do your eyes feel tired by the end of the day?"],
    ["Do you get headaches after screen use?"],
    ["Do your eyes burn after screen use?"],
    ["Do your eyes feel dry or gritty?"],
    ["Does your vision blur when you look up from a screen?"],
    ["Do you rub your eyes often?"],
  ],
  options: FREQ,
  help: "Think about the last two weeks.",
  meter: true,
};

const GLARE: QuizDef = {
  title: "Glare & night vision",
  questions: [
    ["Do headlights cause halos or glare at night?"],
    ["Is it harder to read road signs after dark?"],
    ["Do you avoid driving at night?"],
    ["Do bright lights make you squint or look away?"],
    ["Do your eyes take long to adjust to the dark?"],
  ],
  options: FREQ,
  meter: true,
  night: true,
};

function Quiz({ def, onDone, onExit }: { def: QuizDef } & TestProps) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const cur = answers[i];
  const [q, help] = def.questions[i];

  const pick = (k: number) => {
    const next = answers.slice();
    next[i] = k;
    setAnswers(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (i < def.questions.length - 1) setI(i + 1);
      else onDone({ answers: def.questions.map(([text], n) => ({ question: text, answer: def.options[next[n]!] })) });
    }, 380);
  };

  return (
    <div className="min-h-dvh bg-pearl">
      <div className="mx-auto flex h-dvh min-h-[600px] w-full max-w-[640px] flex-col px-5 pb-8 pt-6 md:pt-10">
        <div className="flex h-11 flex-none items-center">
          <HeaderButton icon="close" label="Exit" onClick={onExit} />
          <span className="flex-1 truncate text-center text-[17px] font-bold">{def.title}</span>
          <span className="w-11" />
        </div>
        <div className="mt-4 flex flex-none gap-1.5" aria-hidden>
          {def.questions.map((_, k) => (
            <span key={k} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-300", k <= i ? "bg-ink" : "bg-line-option")} />
          ))}
        </div>
        <p className="m-0 mt-3 flex-none text-[14px] font-semibold text-muted">
          Question {i + 1} of {def.questions.length}
        </p>
        {def.night && (
          <div
            className="relative mt-3.5 h-[150px] flex-none overflow-hidden rounded-[22px]"
            style={{
              background:
                "radial-gradient(circle at 36% 58%,#FFF6DD 0 8px,rgba(255,236,190,.55) 11px,rgba(255,236,190,0) 46px),radial-gradient(circle at 64% 58%,#FFF6DD 0 8px,rgba(255,236,190,.55) 11px,rgba(255,236,190,0) 46px),linear-gradient(#17191F,#262A33)",
            }}
            aria-hidden
          >
            <span className="absolute bottom-0 left-1/2 -ml-0.5 h-[34px] w-1 rounded-t-[2px] bg-white/28" />
          </div>
        )}
        <h1 className={cn("m-0 text-[30px] font-bold leading-[1.18] tracking-[-0.025em] text-balance", def.night ? "mt-5" : "mt-2")} aria-live="polite">
          {q}
        </h1>
        {(help || def.help) && <p className="m-0 mt-2.5 text-[16px] leading-normal text-muted text-pretty">{help ?? def.help}</p>}
        <div className="min-h-4 flex-1" />
        <div className={cn("flex flex-none flex-col", def.meter ? "gap-2.5" : "gap-3")} role="radiogroup" aria-label={q}>
          {def.options.map((label, k) => {
            const on = cur === k;
            return (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => pick(k)}
                className={cn(
                  "flex items-center border font-semibold transition-[background,color,border-color,transform] duration-200 active:scale-[.98]",
                  def.meter ? "h-16 justify-between gap-3 rounded-[18px] px-5 text-[18px]" : "h-[72px] justify-center rounded-[20px] text-[20px]",
                  on ? "border-ink bg-ink text-white" : "border-line-option bg-white hover:border-[#CFCFCA]",
                )}
              >
                <span>{label}</span>
                {def.meter && (
                  <span className="flex h-4 items-end gap-[3px]" aria-hidden>
                    {[7, 11, 16].map((h, m) => (
                      <span key={h} className="w-1 rounded-[2px]" style={{ height: h, background: k > m ? (on ? "#fff" : "#111") : on ? "rgba(255,255,255,.28)" : "#E4E4E0" }} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => {
            clearTimeout(timer.current);
            setI(Math.max(0, i - 1));
          }}
          className={cn("mt-1.5 h-11 flex-none text-[15px] font-semibold text-muted hover:text-ink", i === 0 && "invisible")}
        >
          Previous question
        </button>
      </div>
    </div>
  );
}

export const RiskScreener = (p: TestProps) => <Quiz def={RISK} {...p} />;
export const EyeStrain = (p: TestProps) => <Quiz def={STRAIN} {...p} />;
export const GlareNight = (p: TestProps) => <Quiz def={GLARE} {...p} />;
