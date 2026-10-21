import type { ReactNode } from "react";

/**
 * Full screen on phones. On a laptop the app sits in a centred phone-sized frame,
 * with a short note beside it on wide screens.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh w-full items-center justify-center gap-16 md:p-6">
      <aside className="hidden max-w-[300px] flex-col gap-4 lg:flex">
        <span className="text-[20px] font-bold tracking-[-0.01em]">Visus</span>
        <p className="m-0 text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-balance">Quick eye checks, right in your browser.</p>
        <p className="m-0 text-[15px] leading-normal text-muted text-pretty">
          Works best on your phone. On a laptop, sit at arm&apos;s length and use your mouse or arrow keys to answer.
        </p>
        <span className="mt-2 flex h-[34px] items-center gap-2 self-start rounded-full bg-[#E3E3DF] px-3.5 text-[14px] font-semibold text-ink-soft">
          Screening, not diagnosis
        </span>
      </aside>
      <div className="relative h-full w-full overflow-hidden bg-pearl md:h-[min(874px,100%)] md:w-[420px] md:flex-none md:rounded-[44px] md:border md:border-[#DCDCD7] md:shadow-[0_30px_80px_rgba(17,17,17,.14)]">
        {children}
      </div>
    </div>
  );
}
