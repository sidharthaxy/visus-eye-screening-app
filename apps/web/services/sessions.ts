import type { NextStep, Status, SubmitResult, TestId, Verdict } from "@visus/shared";

import { api, USE_MOCK } from "./api";
import * as mock from "./mock/sessions";

export type CheckMode = "full" | "quick" | "single" | "glasses";
/** Matches `CreateSessionResponse` in packages/shared. */
export type CreatedSession = { sessionId: string; summary: string; plan: { testId: TestId; reason: string }[] };

/** One row of `GET /sessions`. Not in packages/shared yet, see progress/sidhartha.md. */
export type SessionListItem = {
  id: string;
  date: string;
  mode: CheckMode;
  title: string;
  testCount: number;
  categoryLabel: string;
  status: Status;
};

export type History = {
  sessions: SessionListItem[];
  /** Score per month for the Results trend chart, oldest first. */
  trends: { label: string; months: string[]; values: number[] }[];
};

export async function createSession(input: { profileId: string; intake: string; mode: CheckMode; testId?: TestId }): Promise<CreatedSession> {
  if (USE_MOCK) return mock.create(input);
  return api<CreatedSession>("/sessions", { body: input });
}

/** Raw answers only. The server scores them and decides what comes next. */
export async function submitResult(sessionId: string, result: SubmitResult): Promise<NextStep> {
  if (USE_MOCK) return mock.submit(sessionId, result);
  return api<NextStep>(`/sessions/${sessionId}/results`, { body: result });
}

export async function getVerdict(sessionId: string): Promise<Verdict> {
  if (USE_MOCK) return mock.verdict(sessionId);
  return api<Verdict>(`/sessions/${sessionId}/verdict`, { method: "POST" });
}

export async function getSession(sessionId: string): Promise<Verdict> {
  if (USE_MOCK) return mock.verdict(sessionId);
  return api<Verdict>(`/sessions/${sessionId}`);
}

export async function getHistory(): Promise<History> {
  if (USE_MOCK) return mock.history();
  return api<History>("/sessions");
}

export async function shareSession(sessionId: string): Promise<{ url: string; expiresAt: string }> {
  if (USE_MOCK) return mock.share(sessionId);
  return api(`/sessions/${sessionId}/share`, { method: "POST" });
}
