import type { Status } from '@visus/shared';

import { mockDelay, request, USE_MOCK } from '@/services/api';
import { mockSessions } from '@/services/mock/sessions';

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
