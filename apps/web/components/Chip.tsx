import type { Status } from "@visus/shared";
import type { ReactNode } from "react";

import { cn } from "./cn";
import { Icon } from "./Icon";

/** Selectable pill: answer options and, with `leading`, family members. */
export function Chip({ label, selected, onClick, leading, small }: { label: string; selected?: boolean; onClick?: () => void; leading?: ReactNode; small?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex flex-none items-center gap-2 rounded-full border font-medium transition-colors duration-150",
        leading ? "h-chip pl-1.5 pr-4 text-[15px] font-semibold" : small ? "min-h-10 px-4 py-1.5 text-[15px]" : "min-h-chip px-[18px] py-2 text-opt",
        selected ? "border-ink bg-ink text-white" : "border-line-option bg-white text-ink hover:border-[#CFCFCA]",
      )}
    >
      {leading}
      {label}
    </button>
  );
}

/** Round initial for family chips. */
export function ChipAvatar({ initial, selected }: { initial: string; selected?: boolean }) {
  return (
    <span className={cn("grid size-8 place-items-center rounded-full text-[13px] font-bold", selected ? "bg-white/16" : "bg-fill")}>{initial}</span>
  );
}

export const STATUS: Record<Status, { bg: string; fg: string; dot: string; label: string }> = {
  good: { bg: "bg-good-bg", fg: "text-good", dot: "bg-good-dot", label: "Looks good" },
  mild: { bg: "bg-mild-bg", fg: "text-mild", dot: "bg-mild-dot", label: "Mild change" },
  see_doctor: { bg: "bg-doc-bg", fg: "text-doc", dot: "bg-doc-dot", label: "See a doctor" },
};

/** Small coloured status pill with a dot, e.g. "All clear". */
export function StatusBadge({ status, label, className }: { status: Status; label?: string; className?: string }) {
  const c = STATUS[status];
  return (
    <span className={cn("flex h-[26px] flex-none items-center gap-1.5 self-start rounded-full px-2.5 text-[13px] font-semibold", c.bg, c.fg, className)}>
      <span className={cn("size-1.5 rounded-full", c.dot)} />
      {label ?? c.label}
    </span>
  );
}

/** Grey info pill. `sm` (30px): "Right eye". `md` (34px): Entry "Tests run on your phone". */
export function Pill({ label, leading, size = "sm", className }: { label: string; leading?: ReactNode; size?: "sm" | "md"; className?: string }) {
  return (
    <span
      className={cn(
        "flex flex-none items-center self-start rounded-full bg-pill font-semibold text-ink-soft",
        size === "md" ? "h-[34px] gap-2 px-3.5 text-[14px]" : "h-[30px] gap-1.5 px-3 text-[13px]",
        className,
      )}
    >
      {leading}
      {label}
    </span>
  );
}

/** Full-width answer row with a round radio on the right (onboarding, who is this for, duochrome). */
export function OptionRow({ label, selected, onClick, leading, sub }: { label: ReactNode; selected: boolean; onClick: () => void; leading?: ReactNode; sub?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex min-h-opt w-full items-center justify-between gap-3.5 rounded-[16px] border bg-white px-[18px] py-3 text-left text-opt font-medium transition-[border-color,box-shadow] duration-150",
        selected ? "border-ink shadow-[inset_0_0_0_1px_#111111]" : "border-line-option hover:border-[#CFCFCA]",
      )}
    >
      {leading}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span>{label}</span>
        {sub && <span className="text-[13px] font-normal text-muted">{sub}</span>}
      </span>
      <Radio on={selected} />
    </button>
  );
}

export function Radio({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "grid size-6 flex-none place-items-center rounded-full border-2 transition-colors duration-150",
        on ? "border-ink bg-ink" : "border-radio bg-transparent",
      )}
    >
      {on && <Icon name="check" size={12} color="#FFFFFF" strokeWidth={2.4} />}
    </span>
  );
}

/** iOS-style switch from the design (track accent when on). */
export function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={cn("relative h-[30px] w-[50px] flex-none rounded-full transition-colors duration-200", on ? "bg-acc" : "bg-[#E1E1DC]")}
    >
      <span
        className={cn(
          "absolute left-[3px] top-[3px] size-6 rounded-full bg-white shadow-[0_1px_3px_rgba(17,17,17,.2)] transition-transform duration-200",
          on && "translate-x-5",
        )}
      />
    </button>
  );
}

/** Grey segmented control (Results metric tabs, Settings text size, filters). */
export function Segmented({ options, value, onChange, className, pill }: { options: readonly string[]; value: number; onChange: (i: number) => void; className?: string; pill?: boolean }) {
  return (
    <div role="tablist" className={cn("grid", pill ? "h-9 rounded-full bg-fill p-[3px]" : "gap-1 rounded-[14px] bg-pill p-1", className)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((label, i) => (
        <button
          key={label}
          type="button"
          role="tab"
          aria-selected={i === value}
          onClick={() => onChange(i)}
          className={cn(
            "px-2 text-[14px] font-semibold transition-[background,color,box-shadow] duration-200",
            pill ? "rounded-full" : "h-9 rounded-[10px]",
            i === value ? "bg-white text-ink shadow-[0_1px_3px_rgba(17,17,17,.12)]" : "text-tab-off hover:text-ink",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
