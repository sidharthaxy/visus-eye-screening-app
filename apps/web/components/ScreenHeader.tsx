"use client";

import type { ReactNode } from "react";

import { cn } from "./cn";
import { Icon, type IconName } from "./Icon";
import { useBack } from "./nav";

type Props = {
  title?: ReactNode;
  /** Grey round button on the left: back chevron or close cross. */
  left?: "back" | "close";
  /** Where to go when there's no history to go back to (a direct visit). */
  fallback?: string;
  onLeft?: () => void;
  leftLabel?: string;
  /** Smaller grey title, used for a category ("Clarity") above a big heading. */
  small?: boolean;
  /** Right side: short text ("1 of 5") or a round button. */
  right?: ReactNode;
};

/** The 44 · title · 44 bar at the top of every non-tab screen. */
export function ScreenHeader({ title, left = "back", fallback, onLeft, leftLabel, small, right }: Props) {
  const back = useBack(fallback);
  return (
    <div className="flex h-11 flex-none items-center">
      <HeaderButton icon={left === "back" ? "chevronLeft" : "close"} label={leftLabel ?? (left === "back" ? "Back" : "Close")} onClick={onLeft ?? back} />
      <div className={cn("min-w-0 flex-1 truncate text-center", small ? "text-[15px] font-semibold text-muted" : "text-[17px] font-bold")}>{title}</div>
      <div className="flex w-11 flex-none justify-end">
        {typeof right === "string" ? <span className="whitespace-nowrap text-[13px] font-semibold text-muted">{right}</span> : right}
      </div>
    </div>
  );
}

/** 44px grey round icon button. */
export function HeaderButton({ icon, label, onClick, className }: { icon: IconName; label: string; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn("grid size-11 flex-none place-items-center rounded-full bg-pill transition-transform duration-150 hover:bg-[#E3E3DF] active:scale-[.94]", className)}
    >
      <Icon name={icon} size={icon === "chevronLeft" ? 20 : 18} />
    </button>
  );
}
