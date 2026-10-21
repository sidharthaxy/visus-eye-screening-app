import type {
  CreateSessionRequest,
  CreateSessionResponse,
  NextStep,
  SessionSummary,
  ShareLink,
  SubmitResult,
  Verdict,
} from '@visus/shared';

import { mockDelay, request, USE_MOCK } from '@/services/api';
import { mockCreateSession, mockSession, mockSessions, mockShare, mockSubmitResult, mockVerdict } from '@/services/mock/sessions';

export type { SessionSummary };

/** GET /sessions: past checks, newest first. */
export async function listSessions(): Promise<SessionSummary[]> {
  if (USE_MOCK) return mockDelay(mockSessions());
  return request<SessionSummary[]>('/sessions');
}

/** GET /sessions/:id: the verdict of a finished check. */
export async function getSession(sessionId: string): Promise<Verdict> {
  if (USE_MOCK) {
    await mockDelay(null);
    return mockSession(sessionId);
  }
  return request<Verdict>(`/sessions/${sessionId}`);
}

/** POST /sessions/:id/share: a read-only report link for a doctor, valid 24 hours. */
export async function shareSession(sessionId: string): Promise<ShareLink> {
  if (USE_MOCK) return mockDelay(mockShare(sessionId), 600);
  return request<ShareLink>(`/sessions/${sessionId}/share`, { method: 'POST' });
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

/** POST /sessions/:id/verdict: overall results and ZEISS lens suggestions once the tests are done. */
export async function getVerdict(sessionId: string): Promise<Verdict> {
  if (USE_MOCK) return mockDelay(mockVerdict(sessionId), 2500);
  return request<Verdict>(`/sessions/${sessionId}/verdict`, { method: 'POST' });
}
