"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** Today's date on the client, null while prerendering (so no stale build-time date). */
export function useToday(): Date | null {
  const t = useSyncExternalStore(
    noop,
    () => new Date().toDateString(),
    () => null,
  );
  return t ? new Date(t) : null;
}

export const fmtLong = (d: Date) => `${d.toLocaleDateString("en-GB", { weekday: "long" })}, ${d.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
export const fmtShort = (d: Date | string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
export const fmtFull = (d: Date | string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function daysAgo(d: Date | string, today: Date) {
  const n = Math.round((new Date(today).setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 864e5);
  return n <= 0 ? "Today" : n === 1 ? "Yesterday" : n < 14 ? `${n} days ago` : n < 60 ? `${Math.round(n / 7)} weeks ago` : `${Math.round(n / 30)} months ago`;
}
