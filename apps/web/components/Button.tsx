import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "./cn";
import { Icon } from "./Icon";

type Variant = "primary" | "secondary" | "ghost" | "inverted";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  /** Arrow after the label, as on "Start eye check". */
  arrow?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  leading?: ReactNode;
};

const VARIANTS: Record<Variant, string> = {
  primary: "h-btn bg-ink text-white text-btn hover:bg-[#2a2a2a]",
  secondary: "h-btn bg-white text-ink text-btn border border-line-strong hover:bg-[#FBFBF9]",
  ghost: "h-11 bg-transparent text-muted text-[15px] hover:text-ink",
  inverted: "h-btn bg-white text-ink text-btn hover:bg-[#F4F4F1]",
};

export function Button({ children, href, onClick, variant = "primary", arrow, disabled, type = "button", className, leading }: Props) {
  const cls = cn(
    "flex items-center justify-center gap-2 rounded-[16px] px-5 font-semibold transition-[transform,background,opacity] duration-150 active:scale-[.98] select-none",
    VARIANTS[variant],
    disabled && "pointer-events-none opacity-35",
    className,
  );
  const content = (
    <>
      {leading}
      <span>{children}</span>
      {arrow && <Icon name="arrowRight" size={20} strokeWidth={2.2} />}
    </>
  );
  if (href && !disabled)
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {content}
      </Link>
    );
  return (
    <button type={type} onClick={onClick} disabled={disabled} aria-disabled={disabled} className={cls}>
      {content}
    </button>
  );
}
