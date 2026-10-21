"use client";

import { useState, type InputHTMLAttributes } from "react";

import { cn } from "./cn";

const INPUT =
  "h-[52px] w-full rounded-[16px] border border-line-strong bg-white px-4 text-[16px] text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-ink focus:shadow-[0_0_0_4px_rgba(17,17,17,.06)] focus-visible:outline-none";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: React.ReactNode };

export function TextField({ label, hint, className, ...input }: Props) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[14px] font-semibold text-ink-soft">{label}</span>
      <input {...input} className={cn(INPUT, className)} />
      {hint}
    </label>
  );
}

/** Password input with the show/hide eye button from the design. */
export function PasswordField({ label, hint, ...input }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={input.id} className="text-[14px] font-semibold text-ink-soft">
        {label}
      </label>
      <div className="relative">
        <input {...input} type={show ? "text" : "password"} className={cn(INPUT, "pr-[52px]")} />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-1 top-1 grid size-11 place-items-center rounded-[12px] text-muted hover:text-ink"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            {show ? (
              <>
                <path d="M3.5 3.5l17 17" />
                <path d="M10.6 5.6c.5-.1.9-.1 1.4-.1 6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.6 6.6C3.9 8.4 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.4 4.3-1" />
                <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
              </>
            ) : (
              <>
                <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
      </div>
      {hint}
    </div>
  );
}

/** − [ 34 years ] + stepper used for age (onboarding, family, edit profile). */
export function AgeStepper({ value, onChange, min = 5, max = 110, compact }: { value: number | ""; onChange: (v: number | "") => void; min?: number; max?: number; compact?: boolean }) {
  const n = value === "" ? 30 : value;
  const btn =
    "grid flex-none place-items-center rounded-full border border-line-strong bg-white transition-transform duration-150 hover:bg-card-hover active:scale-[.94]";
  return (
    <div className={cn("flex items-center", compact ? "gap-3" : "justify-center gap-5")}>
      <button type="button" aria-label="Decrease age" onClick={() => onChange(Math.max(min, n - 1))} className={cn(btn, compact ? "size-11" : "size-[60px]")}>
        <svg width={compact ? 18 : 22} height={compact ? 18 : 22} viewBox="0 0 20 20" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round">
          <path d="M4 10h12" />
        </svg>
      </button>
      {compact ? (
        <span className="min-w-[90px] text-center text-[17px] font-semibold">{n} years</span>
      ) : (
        <div className="flex h-[132px] w-[150px] flex-col items-center justify-center gap-0.5 rounded-[24px] border border-line bg-white">
          <input
            value={value}
            inputMode="numeric"
            aria-label="Age in years"
            onChange={(e) => {
              const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
              onChange(isNaN(v) ? "" : Math.min(max, v));
            }}
            className="w-[120px] border-none bg-transparent p-0 text-center text-[58px] font-bold leading-[1.05] tracking-[-0.03em] outline-none focus-visible:outline-none"
          />
          <span className="text-[15px] text-muted">years</span>
        </div>
      )}
      <button type="button" aria-label="Increase age" onClick={() => onChange(Math.min(max, n + 1))} className={cn(btn, compact ? "size-11" : "size-[60px]")}>
        <svg width={compact ? 18 : 22} height={compact ? 18 : 22} viewBox="0 0 20 20" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round">
          <path d="M4 10h12M10 4v12" />
        </svg>
      </button>
    </div>
  );
}
