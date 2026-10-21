import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "./cn";
import { Icon } from "./Icon";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Content of the 38px round icon on the left (an Icon, a letter...). */
  icon?: ReactNode;
  /** Accent-tinted icon circle instead of grey (Tests list numbers, avatars). */
  accent?: boolean;
  /** Right side, before the chevron: short text or a StatusBadge. */
  right?: ReactNode;
  chevron?: boolean;
  /** First row in a card has no top divider. */
  first?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
};

/** A row inside a flush Card. Rows after the first get a divider. */
export function ListRow({ title, subtitle, icon, accent, right, chevron = true, first, href, onClick, className }: Props) {
  const cls = cn(
    "flex min-h-[62px] w-full items-center gap-3.5 bg-white px-4 py-2.5 text-left transition-colors duration-150",
    !first && "border-t border-divider",
    (href || onClick) && "hover:bg-card-hover",
    className,
  );
  const content = (
    <>
      {icon !== undefined && (
        <span
          className={cn(
            "grid size-[38px] flex-none place-items-center rounded-full font-bold",
            accent ? "bg-acc-soft text-[15px] text-acc-ink" : "bg-fill text-[18px] text-ink",
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[16px] font-semibold leading-[1.25]">{title}</span>
        {subtitle && <span className="text-[13px] text-muted">{subtitle}</span>}
      </span>
      {typeof right === "string" ? <span className="flex-none text-[13px] text-muted">{right}</span> : right}
      {chevron && <Icon name="chevronRight" size={16} color="#9A9A95" strokeWidth={2.2} className="flex-none" />}
    </>
  );
  if (href)
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={cls}>
        {content}
      </button>
    );
  return <div className={cls}>{content}</div>;
}
