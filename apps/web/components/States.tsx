"use client";

import { Button } from "./Button";
import { Icon } from "./Icon";
import { Screen } from "./Screen";
import { ScreenHeader } from "./ScreenHeader";

/** Screen 55: shared error state with Retry. */
export function ErrorState({
  title = "Something went wrong",
  body = "We couldn't load this page. Your saved checks are safe.",
  onRetry,
  retrying,
}: {
  title?: string;
  body?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <Screen gap="gap-0">
      <ScreenHeader fallback="/home" />
      <div className="flex flex-1 flex-col items-center justify-center pb-6 text-center">
        <span className="grid size-[88px] place-items-center rounded-full bg-pill">
          <Icon name="info" size={38} strokeWidth={1.7} className="rotate-180" />
        </span>
        <h1 className="m-0 mt-6 text-[28px] font-bold leading-[1.15] tracking-[-0.025em]">{title}</h1>
        <p className="m-0 mt-2.5 max-w-[300px] text-[16px] leading-normal text-muted text-pretty">{body}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} disabled={retrying} leading={<Icon name="refresh" size={20} />}>
          {retrying ? "Retrying…" : "Retry"}
        </Button>
      )}
      <Button href="/home" variant="ghost" className="mt-1">
        Go to Home
      </Button>
    </Screen>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted" role="status">
        <span className="size-8 animate-spin rounded-full border-[3px] border-line-option border-t-ink" />
        <span className="text-[15px] font-semibold">{label}</span>
      </div>
    </Screen>
  );
}

/** Screen 54: grey "You're offline" pill. */
export function OfflinePill() {
  return (
    <span className="flex h-8 flex-none items-center gap-2 self-center rounded-full bg-pill px-3.5 text-[13px] font-semibold text-ink-soft">
      <Icon name="wifiOff" size={16} />
      You&apos;re offline
    </span>
  );
}
