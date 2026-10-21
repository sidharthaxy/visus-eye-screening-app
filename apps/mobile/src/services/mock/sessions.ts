import type { SessionSummary } from '@/services/sessions';

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export function mockSessions(): SessionSummary[] {
  return [{ id: 'session-1', date: daysAgo(7), mode: 'full', headline: 'All clear', status: 'good' }];
}
