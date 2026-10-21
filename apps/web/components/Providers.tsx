"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

import { useCalibration } from "@/store/calibration";
import { useCheck } from "@/store/check";
import { markHydrated } from "@/store/hydrated";
import { useSettings } from "@/store/settings";

import { useTrackNav } from "./nav";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }));
  const textSize = useSettings((s) => s.textSize);
  useTrackNav();

  useEffect(() => {
    useSettings.persist.rehydrate();
    useCalibration.persist.rehydrate();
    useCheck.persist.rehydrate();
    markHydrated();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("large-text", textSize > 0);
  }, [textSize]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
