import type { ReactNode } from "react";

import { cn } from "@/components/cn";
import { TestHeader } from "@/components/TestHeader";

import { EYE_LABEL, type TestProps } from "./types";

type Props = Pick<TestProps, "eye" | "onExit" | "onPause"> & {
  title: string;
  progress?: string;
  children: ReactNode;
  className?: string;
};

/** Fixed-height test layout: header, then the test fills the rest of the screen. */
export function TestFrame({ title, eye, progress, onExit, onPause, children, className }: Props) {
  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-pearl">
      <div className={cn("flex h-full min-h-[640px] flex-col px-5 pb-8 pt-6", className)}>
        <TestHeader title={title} eyeLabel={EYE_LABEL[eye]} progress={progress} onExit={onExit} onPause={onPause} />
        {children}
      </div>
    </div>
  );
}

/** Two-button footer used by most tests: a toggle ("All look the same") and Next/Done. */
export function TestFooter({
  summary,
  alt,
  altOn,
  onAlt,
  next = "Next",
  canNext,
  onNext,
}: {
  summary: string;
  alt: string;
  altOn: boolean;
  onAlt: () => void;
  next?: string;
  canNext: boolean;
  onNext: () => void;
}) {
  return (
    <>
      <p className="m-0 mt-3 flex-none text-center text-[14px] font-semibold text-ink-soft" aria-live="polite">
        {summary}
      </p>
      <div className="mt-3 grid flex-none grid-cols-2 gap-2.5">
        <button
          type="button"
          aria-pressed={altOn}
          onClick={onAlt}
          className={cn(
            "h-btn rounded-[16px] border text-[16px] font-semibold transition-[background,color,border-color,transform] duration-200 active:scale-[.98]",
            altOn ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink hover:bg-card-hover",
          )}
        >
          {alt}
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          className="h-btn rounded-[16px] bg-ink text-btn font-semibold text-white transition-[opacity,transform] duration-200 active:scale-[.98] disabled:opacity-35"
        >
          {next}
        </button>
      </div>
    </>
  );
}
