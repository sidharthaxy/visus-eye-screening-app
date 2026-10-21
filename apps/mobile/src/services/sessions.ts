import type { CreateSessionRequest, CreateSessionResponse, NextStep, Status, SubmitResult } from '@visus/shared';

import { mockDelay, request, USE_MOCK } from '@/services/api';
import { mockCreateSession, mockSessions, mockSubmitResult } from '@/services/mock/sessions';

/**
 * One row of GET /sessions (docs/API.md: id, date, mode, headline, overall status).
 * Not in @visus/shared yet; move it there when the route is built.
 */
export type SessionSummary = {
  id: string;
  date: string; // ISO date
  mode: 'full' | 'quick' | 'single' | 'glasses';
  headline: string;
  status: Status;
};

/** GET /sessions, newest first. */
export async function listSessions(): Promise<SessionSummary[]> {
  if (USE_MOCK) return mockDelay(mockSessions());
  return request<SessionSummary[]>('/sessions');
}

export type NewSession = ReturnType<typeof CreateSessionRequest.parse>;
export type Session = ReturnType<typeof CreateSessionResponse.parse>;

/** POST /sessions: the agent reads the intake and returns a test plan. */
export async function createSession(input: NewSession): Promise<Session> {
  if (USE_MOCK) return mockDelay(mockCreateSession(input), 1200);
  return request<Session>('/sessions', { method: 'POST', body: input });
}

/** POST /sessions/:id/results: raw answers of one test. The server scores them and says what comes next. */
export async function submitResult(sessionId: string, input: SubmitResult): Promise<NextStep> {
  if (USE_MOCK) return mockDelay(mockSubmitResult(sessionId, input), 900);
  return request<NextStep>(`/sessions/${sessionId}/results`, { method: 'POST', body: input });
}
