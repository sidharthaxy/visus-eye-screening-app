import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "./cn";

type Props = {
  children: ReactNode;
  /** Dark hero card, as on Home "Time for your eye check". */
  dark?: boolean;
  /** No inner padding, for cards that hold ListRows. */
  flush?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
};

export function Card({ children, dark, flush, href, onClick, className }: Props) {
  const cls = cn(
    dark ? "rounded-[24px] bg-hero p-5 text-white" : "rounded-[20px] border border-line bg-white",
    !dark && (flush ? "flex flex-col overflow-hidden" : "p-4"),
    (href || onClick) && "text-left transition-[transform,border-color] duration-150 hover:border-[#D6D6D1] active:scale-[.98]",
    className,
  );
  if (href)
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={cls}>
        {children}
      </button>
    );
  return <div className={cls}>{children}</div>;
}

/** Small section heading with an optional right link, e.g. "Popular tests · See all". */
export function SectionTitle({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="m-0 text-[18px] font-bold tracking-[-0.01em]">{title}</h3>
      {action && href && (
        <Link href={href} className="py-2 text-[15px] font-semibold hover:text-muted">
          {action}
        </Link>
      )}
    </div>
  );
}
