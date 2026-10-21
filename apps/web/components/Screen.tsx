import type { ReactNode } from "react";

import { cn } from "./cn";

type Props = {
  children?: ReactNode;
  /** Small grey line above the title, e.g. the date on Home. */
  eyebrow?: ReactNode;
  title?: ReactNode;
  /** Leaves room for the floating tab bar. */
  tabs?: boolean;
  /** Clinical white background for test screens. */
  white?: boolean;
  /** Gap between children (Tailwind class). */
  gap?: string;
  className?: string;
};

/** Page wrapper: pearl background, 20px side gutter, scrolls inside the phone frame. */
export function Screen({ children, eyebrow, title, tabs, white, gap = "gap-4", className }: Props) {
  return (
    <div className={cn("no-scrollbar h-full overflow-y-auto", white ? "bg-white" : "bg-pearl")}>
      <main className={cn("flex min-h-full flex-col px-5 pt-6", tabs ? "pb-[112px]" : "pb-8", gap, className)}>
        {(eyebrow || title) && (
          <header className="flex flex-col gap-0.5">
            {eyebrow && <span className="text-[14px] font-semibold text-muted">{eyebrow}</span>}
            {title && <h1 className="m-0 text-[30px] font-bold leading-[1.15] tracking-[-0.025em]">{title}</h1>}
          </header>
        )}
        {children}
      </main>
    </div>
  );
}

/** Pushes what follows to the bottom of a Screen. */
export const Spacer = ({ min = 16 }: { min?: number }) => <div className="flex-1" style={{ minHeight: min }} />;

export function Disclaimer({ children = "Screening, not diagnosis." }: { children?: ReactNode }) {
  return <p className="m-0 text-center text-[13px] leading-normal text-muted">{children}</p>;
}
