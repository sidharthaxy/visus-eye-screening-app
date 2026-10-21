"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { cn } from "@/components/cn";
import { Icon } from "@/components/Icon";
import { ScreenHeader } from "@/components/ScreenHeader";
import { OfflinePill } from "@/components/States";
import { useStartCheck } from "@/lib/useStartCheck";
import { listProfiles } from "@/services/profiles";
import { useCheck } from "@/store/check";

const FOLLOW_UPS: [string, string[]][] = [
  ["Is it in both eyes, or one more than the other?", ["Both eyes", "Mostly left", "Mostly right"]],
  ["How long has it been happening?", ["A few days", "A few weeks", "Months or more"]],
  ["Any pain, redness or flashes of light?", ["None of those", "Some discomfort", "Yes, flashes"]],
];

type Msg = { from: "ai" | "me"; text: string };

const subscribe = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};

export default function Intake() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  const profileId = useCheck((s) => s.profileId);
  const profiles = useQuery({ queryKey: ["profiles"], queryFn: listProfiles });
  const name = (profiles.data?.find((p) => p.id === profileId) ?? profiles.data?.[0])?.name.split(" ")[0];
  const start = useStartCheck();

  const [answers, setAnswers] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);

  const step = answers.length; // 0 = the complaint, 1–3 = follow-ups
  const chatDone = step === 4 && !typing;

  const msgs: Msg[] = [{ from: "ai", text: `Hi${name ? ` ${name}` : ""}. What's bothering your eyes today?` }];
  answers.forEach((a, i) => {
    msgs.push({ from: "me", text: a });
    if (i < 3 && (i < answers.length - 1 || !typing)) msgs.push({ from: "ai", text: FOLLOW_UPS[i][0] });
  });
  const chips = !typing && step >= 1 && step <= 3 ? FOLLOW_UPS[step - 1][1] : [];

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [answers.length, typing, start.isPending]);

  const answer = (raw: string) => {
    const v = raw.trim();
    if (!v || typing || step >= 4) return;
    const next = [...answers, v];
    setAnswers(next);
    setText("");
    setTyping(true);
    setTimeout(() => setTyping(false), 900);
  };

  const intake = answers.map((a, i) => (i === 0 ? a : `${FOLLOW_UPS[i - 1][0]} ${a}`)).join("\n");
  const canSend = text.trim().length > 0 && !typing && step < 4;

  return (
    <div className="flex h-full flex-col bg-pearl px-5 pb-8 pt-6">
      <ScreenHeader title="New check" fallback="/home" />
      {!online && <div className="mt-3 flex justify-center"><OfflinePill /></div>}

      <div className="no-scrollbar -mx-5 min-h-0 flex-1 overflow-y-auto px-5">
        <div className="flex min-h-full flex-col justify-end gap-3 pb-3.5 pt-4" aria-live="polite">
          {msgs.map((m, i) => (
            <Bubble key={i} {...m} />
          ))}
          {chips.length > 0 && online && (
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => answer(c)}
                  className="h-11 rounded-full border border-line-strong bg-white px-4 text-[15px] font-semibold transition-[border-color,transform] duration-150 hover:border-ink active:scale-[.97]"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          {(typing || start.isPending) && <Typing />}
          {chatDone && !start.isPending && !start.isSuccess && online && (
            <div className="flex flex-col items-start gap-2">
              <Bubble from="ai" text="Thanks, that helps. I'll pick the right tests for you now." />
              {start.isError && <span className="text-[14px] text-doc">Couldn&apos;t make your plan. Try again.</span>}
              <button
                type="button"
                onClick={() => start.mutate({ mode: "full", intake })}
                className="flex h-11 items-center gap-2 rounded-full bg-ink px-[18px] text-[15px] font-semibold text-white transition-transform duration-150 active:scale-[.97]"
              >
                See my test plan
                <Icon name="arrowRight" size={18} strokeWidth={2.2} />
              </button>
            </div>
          )}
          {!online && (
            <div className="flex flex-col gap-3.5 rounded-[20px] border border-line bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-10 flex-none place-items-center rounded-full bg-fill">
                  <Icon name="wifiOff" size={20} strokeWidth={1.9} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <span className="text-[16px] font-bold">AI chat needs internet</span>
                  <span className="text-[14px] leading-[1.45] text-muted text-pretty">Tests still work. Pick them yourself and run them one at a time.</span>
                </div>
              </div>
              <Link href="/tests" className="flex h-12 items-center justify-center gap-2 rounded-[14px] bg-ink text-[16px] font-semibold text-white active:scale-[.98]">
                Choose tests myself
                <Icon name="arrowRight" size={18} strokeWidth={2.2} />
              </Link>
            </div>
          )}
          <div ref={end} />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          answer(text);
        }}
        className={cn("flex h-14 flex-none items-center gap-1 rounded-full border pl-[18px] pr-1.5", online ? "border-line-strong bg-white" : "border-line-option bg-fill")}
      >
        <input
          autoFocus
          value={text}
          disabled={!online}
          onChange={(e) => setText(e.target.value)}
          placeholder={!online ? "Chat is offline" : chatDone ? "Add anything else…" : "Type your answer…"}
          aria-label="Your message"
          className="min-w-0 flex-1 border-none bg-transparent text-[16px] outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:text-[#8A8A85]"
        />
        <button type="button" disabled aria-label="Voice input, coming soon" title="Voice input coming soon" className="grid size-11 flex-none place-items-center rounded-full opacity-30">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
          </svg>
        </button>
        <button type="submit" aria-label="Send" disabled={!canSend} className={cn("grid size-11 flex-none place-items-center rounded-full transition-colors duration-200", canSend ? "bg-ink" : "bg-[#D6D6D1]")}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 16V4M5 9l5-5 5 5" />
          </svg>
        </button>
      </form>
      <p className="m-0 mt-2.5 text-center text-[12px] leading-[1.4] text-[#8A8A85]">Visus isn&apos;t a diagnosis. Sudden vision loss? See a doctor now.</p>
    </div>
  );
}

function Bubble({ from, text }: Msg) {
  return (
    <div
      className={cn(
        "max-w-[82%] px-[15px] py-[11px] text-[16px] leading-[1.4] text-pretty",
        from === "ai" ? "self-start rounded-[18px_18px_18px_6px] border border-line bg-white" : "self-end rounded-[18px_18px_6px_18px] bg-ink text-white",
      )}
    >
      {text}
    </div>
  );
}

function Typing() {
  return (
    <div className="flex h-[42px] items-center gap-[5px] self-start rounded-[18px_18px_18px_6px] border border-line bg-white px-4" aria-label="Typing">
      {["#BDBDB8", "#A5A5A0", "#8A8A85"].map((c, i) => (
        <span key={c} className="size-[7px] animate-pulse rounded-full" style={{ background: c, animationDelay: `${i * 150}ms` }} />
      ))}
    </div>
  );
}
