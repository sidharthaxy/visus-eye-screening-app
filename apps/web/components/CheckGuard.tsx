"use client";

import type { ReactNode } from "react";

import { useCheck } from "@/store/check";
import { useHydrated } from "@/store/hydrated";

import { Button } from "./Button";
import { Icon } from "./Icon";
import { Screen } from "./Screen";
import { ScreenHeader } from "./ScreenHeader";

/** Renders children only when a check is in progress; otherwise offers to start one. */
export function CheckGuard({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const sessionId = useCheck((s) => s.sessionId);
  if (!hydrated) return <Screen />;
  if (sessionId) return children;
  return (
    <Screen gap="gap-0">
      <ScreenHeader left="close" fallback="/home" />
      <div className="flex flex-1 flex-col items-center justify-center pb-6 text-center">
        <span className="grid size-[88px] place-items-center rounded-full bg-pill">
          <Icon name="eye" size={38} strokeWidth={1.7} />
        </span>
        <h1 className="m-0 mt-6 text-[28px] font-bold leading-[1.15] tracking-[-0.025em]">No check in progress</h1>
        <p className="m-0 mt-2.5 max-w-[300px] text-[16px] leading-normal text-muted text-pretty">Start a new eye check to pick up from here.</p>
      </div>
      <Button href="/check/intake" arrow>
        Start eye check
      </Button>
      <Button href="/home" variant="ghost" className="mt-1">
        Go to Home
      </Button>
    </Screen>
  );
}
