"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { cn } from "@/components/cn";
import { Icon } from "@/components/Icon";
import { Screen, Spacer } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";

type CamState = "idle" | "asking" | "allowed" | "blocked";

/** Screen 41. Web asks for the camera only (no push notifications on web). */
export default function Permissions() {
  const [cam, setCam] = useState<CamState>("idle");

  const ask = async () => {
    if (cam === "allowed") return;
    setCam("asking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      stream.getTracks().forEach((t) => t.stop());
      setCam("allowed");
    } catch {
      setCam("blocked");
    }
  };

  return (
    <Screen gap="gap-0">
      <ScreenHeader title="Permissions" fallback="/home" />
      <h1 className="m-0 mt-5 text-[28px] font-bold leading-[1.15] tracking-[-0.025em]">One quick permission</h1>
      <p className="m-0 mt-1.5 text-[16px] leading-normal text-muted text-pretty">Visus works without it, but tests work best with it on.</p>

      <div className="mt-[22px] flex flex-none flex-col gap-3.5 rounded-[20px] border border-line bg-white p-4">
        <div className="flex items-start gap-3.5">
          <span className="grid size-11 flex-none place-items-center rounded-full bg-acc-soft text-acc-ink">
            <Icon name="camera" size={22} strokeWidth={1.9} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[17px] font-bold">Camera</span>
            <span className="text-[15px] leading-[1.45] text-muted text-pretty">Only measures how far your face is from the screen. It never records or saves anything.</span>
          </div>
        </div>
        <button
          type="button"
          onClick={ask}
          disabled={cam === "asking"}
          className={cn(
            "flex h-12 items-center justify-center gap-2 rounded-[14px] text-[16px] font-semibold transition-[background,color,transform] duration-[250ms] active:scale-[.98]",
            cam === "allowed" ? "bg-good-bg text-good" : cam === "blocked" ? "bg-mild-bg text-mild" : "bg-ink text-white",
          )}
        >
          {cam === "allowed" && <Icon name="checkLg" size={18} strokeWidth={2.4} />}
          {cam === "allowed" ? "Allowed" : cam === "asking" ? "Asking…" : cam === "blocked" ? "Blocked · allow it in your browser" : "Allow"}
        </button>
      </div>

      <Spacer />
      <div className="mb-2.5 flex flex-none items-center justify-center gap-2 text-[13px] text-muted">
        <Icon name="shield" size={16} />
        <span>Change this anytime in your browser settings.</span>
      </div>
      {cam === "allowed" ? (
        <Button href="/check/who">Continue</Button>
      ) : (
        <Button href="/check/who" variant="ghost" className="h-btn text-[16px]!">
          Not now
        </Button>
      )}
    </Screen>
  );
}
