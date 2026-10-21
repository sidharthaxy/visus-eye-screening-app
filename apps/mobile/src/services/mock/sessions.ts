import type { NextStep, ScoredResult, SubmitResult, TestId } from '@visus/shared';

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
/** Plan per mock session, so a result can return the test after it. */
const plans = new Map<string, TestId[]>();
/** Sessions that already got the Amsler red flag (it fires once). */
const flagged = new Set<string>();

/** Mock agent: a fixed plan. The real one reads the intake text. */
export function mockCreateSession(input: NewSession): Session {
  const tests = input.mode === 'single' && input.testId ? [input.testId] : PLANS[input.mode];
  const eyes = /Eyes: (.+)/.exec(input.intake)?.[1]?.toLowerCase();
  const sessionId = `session-${nextId++}`;
  plans.set(sessionId, tests);
  return {
    sessionId,
    summary:
      input.mode === 'single'
        ? 'The test you picked.'
        : `Based on what you described${eyes ? `, in ${eyes === 'both eyes' ? 'both eyes' : eyes.replace('mostly ', 'mostly the ') + ' eye'}` : ''}.`,
    plan: tests.map((testId) => ({ testId, reason: REASONS[testId] ?? 'Picked for you' })),
  };
}

const RESULTS: Partial<Record<TestId, Omit<ScoredResult, 'testId' | 'eye'>>> = {
  tumbling_e: { score: 82, status: 'mild', summary: 'Right eye 6/6, left eye 6/9' },
  clock_dial: { score: 94, status: 'good', summary: 'Lines look even in both eyes' },
  amsler: { score: 40, status: 'see_doctor', summary: 'Wavy lines near the centre, left eye' },
  contrast: { score: 74, status: 'mild', summary: 'Needs a little more contrast to see faint letters' },
};

/**
 * Mock scorer: fixed results whatever the answers. Amsler raises a red flag
 * once per session; otherwise the next test in the plan, then done.
 */
export function mockSubmitResult(sessionId: string, input: SubmitResult): NextStep {
  const result: ScoredResult = {
    testId: input.testId,
    eye: input.eye,
    ...(RESULTS[input.testId] ?? { score: 90, status: 'good', summary: 'Looks good' }),
  };
  if (input.testId === 'amsler' && !flagged.has(sessionId)) {
    flagged.add(sessionId);
    return { type: 'red_flag', result, finding: 'Wavy lines near the centre' };
  }
  const plan = plans.get(sessionId) ?? [];
  const at = plan.indexOf(input.testId);
  const next = at >= 0 ? plan[at + 1] : undefined;
  if (!next) return { type: 'done', result };
  return { type: 'next_test', result, testId: next, reason: REASONS[next] ?? 'Picked for you', added: false };
}
