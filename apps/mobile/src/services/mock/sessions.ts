import type { TestId } from '@visus/shared';

import type { NewSession, Session, SessionSummary } from '@/services/sessions';

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export function mockSessions(): SessionSummary[] {
  return [{ id: 'session-1', date: daysAgo(7), mode: 'full', headline: 'All clear', status: 'good' }];
}

const REASONS: Partial<Record<TestId, string>> = {
  tumbling_e: 'Sharpness of far-away detail',
  clock_dial: 'Can make lights streak at night',
  amsler: 'Checks for wavy or missing lines',
  contrast: 'Night blur often starts here',
};

const PLANS: Record<NewSession['mode'], TestId[]> = {
  full: ['tumbling_e', 'clock_dial', 'amsler', 'contrast'],
  quick: ['tumbling_e', 'amsler', 'clock_dial'],
  glasses: ['tumbling_e'],
  single: [],
};

let nextId = 2;

/** Mock agent: a fixed plan. The real one reads the intake text. */
export function mockCreateSession(input: NewSession): Session {
  const tests = input.mode === 'single' && input.testId ? [input.testId] : PLANS[input.mode];
  const eyes = /Eyes: (.+)/.exec(input.intake)?.[1]?.toLowerCase();
  return {
    sessionId: `session-${nextId++}`,
    summary:
      input.mode === 'single'
        ? 'The test you picked.'
        : `Based on what you described${eyes ? `, in ${eyes === 'both eyes' ? 'both eyes' : eyes.replace('mostly ', 'mostly the ') + ' eye'}` : ''}.`,
    plan: tests.map((testId) => ({ testId, reason: REASONS[testId] ?? 'Picked for you' })),
  };
}
