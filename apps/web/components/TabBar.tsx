"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "./cn";
import { Icon, type IconName } from "./Icon";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/tests", label: "Tests", icon: "eye" },
  { href: "/results", label: "Results", icon: "results" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

/** Floating pill tab bar from the design. */
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="absolute inset-x-4 bottom-[26px] z-10 grid h-[66px] grid-cols-4 gap-1 rounded-[24px] border border-line bg-white p-1.5 shadow-[0_10px_30px_rgba(17,17,17,.08)]"
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
