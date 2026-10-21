"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/Button";
import { CheckGuard } from "@/components/CheckGuard";
import { Icon } from "@/components/Icon";
import { Screen, Spacer } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { nextPlannedTest, useCheck } from "@/store/check";

export default function Distance() {
  return (
    <CheckGuard>
      <DistanceScreen />
    </CheckGuard>
  );
}

/**
 * Screen 12. Shows the front camera so the user can line up their face. Measuring the
 * distance (MediaPipe) comes in the build sprint; until then the user confirms it.
 */
function DistanceScreen() {
  const video = useRef<HTMLVideoElement>(null);
  const [cam, setCam] = useState<"starting" | "on" | "off">("starting");
  const next = useCheck((s) => nextPlannedTest(s));

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" } })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        if (video.current) video.current.srcObject = s;
        setCam("on");
      })
      .catch(() => setCam("off"));
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <Screen gap="gap-0">
      <ScreenHeader title="Distance" right="2 of 2" fallback="/check/calibrate" />
      <div className="relative mt-4 h-[390px] max-h-[48dvh] min-h-[240px] flex-none overflow-hidden rounded-[28px] bg-[#1F1F1E]">
        <video ref={video} autoPlay playsInline muted className="absolute inset-0 size-full -scale-x-100 object-cover" />
        <div className="absolute left-1/2 top-[52%] h-[250px] max-h-[64%] w-[190px] max-w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-dashed border-white/40" />
        <div className="absolute left-1/2 top-4 flex h-9 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-mild-bg px-3.5 text-[15px] font-semibold text-mild">
          <span className="size-[7px] rounded-full bg-current" />
          {cam === "off" ? "Camera is off" : "Fit your face in the oval"}
        </div>
        <div className="absolute bottom-3.5 left-4 flex items-center gap-1.5 text-[12px] font-semibold text-white/65">
          <span className="size-1.5 rounded-full bg-white/65" />
          Front camera
        </div>
      </div>

      <div className="mt-5 flex flex-none items-baseline justify-between gap-3">
        <span className="text-[34px] font-bold leading-none tracking-[-0.03em] tabular-nums">~40 cm</span>
        <span className="text-[14px] text-muted">Aim for 35–45 cm</span>
      </div>
      <div className="relative mt-4 h-2 flex-none rounded-full bg-line">
        <div className="absolute inset-y-0 left-[33.3%] w-[16.7%] rounded-full bg-[#BFE3CC]" />
        <div className="absolute left-[41.7%] top-1/2 -ml-2.5 -mt-2.5 size-5 rounded-full border-[3px] border-white bg-ink shadow-[0_1px_4px_rgba(0,0,0,.25)]" />
      </div>
      <div className="mt-2 flex flex-none justify-between text-[12px] text-[#8A8A85]">
        <span>Closer</span>
        <span>Further</span>
      </div>
      <p className="m-0 mt-3 text-[14px] leading-normal text-muted text-pretty">
        Hold the screen about a forearm&apos;s length away. Automatic distance checking is coming soon.
      </p>

      <Spacer min={12} />
      <div className="mb-3 flex flex-none items-center justify-center gap-2 text-[13px] text-muted">
        <Icon name="shield" size={16} />
        <span>Only used to measure distance. Nothing is saved.</span>
      </div>
      <Button href={next ? `/check/${next}/instructions` : "/check/analysing"}>Continue</Button>
    </Screen>
  );
}
