"use client";

import { useQuery } from "@tanstack/react-query";

import { getSession } from "@/services/sessions";
import { useCheck } from "@/store/check";

/** Verdict for a session: the one just made in this check, else loaded from the server. */
export function useVerdict(sessionId: string) {
  const local = useCheck((s) => (s.verdict?.sessionId === sessionId ? s.verdict : null));
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => getSession(sessionId),
    initialData: local ?? undefined,
    staleTime: 60_000,
  });
}
