"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

let visited = 0;

/** Counts in-app page visits so Back knows whether there is a page of ours to go back to. */
export function useTrackNav() {
  const pathname = usePathname();
  useEffect(() => {
    visited += 1;
  }, [pathname]);
}

/** Goes back, or to `fallback` when the page was opened directly. */
export function useBack(fallback = "/home") {
  const router = useRouter();
  return () => (visited > 1 ? router.back() : router.replace(fallback));
}
