"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { initials, listProfiles } from "@/services/profiles";

import { cn } from "./cn";
import { Icon, type IconName } from "./Icon";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/tests", label: "Tests", icon: "eye" },
  { href: "/results", label: "Results", icon: "results" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

/** Phones: the floating pill tab bar from the design. Hidden from md up (TopNav takes over). */
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-4 bottom-[26px] z-10 grid h-[66px] grid-cols-4 gap-1 rounded-[24px] border border-line bg-white p-1.5 shadow-[0_10px_30px_rgba(17,17,17,.08)] md:hidden"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-[3px] rounded-[18px] text-[12px] font-semibold transition-colors duration-150",
              active ? "bg-ink text-white" : "text-tab-off hover:bg-pressed hover:text-ink",
            )}
          >
            <Icon name={tab.icon} size={22} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Desktop: top bar with the same four tabs, Start eye check and the profile avatar. */
export function TopNav() {
  const pathname = usePathname();
  const profiles = useQuery({ queryKey: ["profiles"], queryFn: listProfiles });
  const me = profiles.data?.find((p) => p.relation === "You") ?? profiles.data?.[0];

  return (
    <header className="sticky top-0 z-20 hidden border-b border-line bg-white/95 backdrop-blur md:block">
      <div className="mx-auto flex max-w-[1200px] items-center gap-6 px-8 py-3.5">
        <Link href="/home" className="text-[22px] font-bold tracking-[-0.01em]">
          Visus
        </Link>
        <nav aria-label="Main" className="flex flex-1 flex-wrap gap-1">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn("flex h-10 items-center rounded-[12px] px-3.5 text-[15px] font-semibold transition-colors", active ? "bg-ink text-white" : "text-muted hover:bg-pressed hover:text-ink")}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/check/who" className="flex h-11 items-center gap-2 rounded-[14px] bg-ink px-[18px] text-[15px] font-semibold text-white transition-colors hover:bg-[#2a2a2a]">
          Start eye check
        </Link>
        <Link href="/profile" aria-label="Profile" className="grid size-10 place-items-center rounded-full bg-acc-soft text-[14px] font-bold text-acc-ink">
          {me ? initials(me.name) : <Icon name="profile" size={18} />}
        </Link>
      </div>
    </header>
  );
}
