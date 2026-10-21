// Gemini calls: initial test plan, re-plan, verdict text.
// Output validated with zod; on any failure we fall back to rules. Only picks tests from TEST_CATALOG.
import { TEST_CATALOG, TestId, type IntakeChatResponse, type IntakeMessage, type Profile, type ScoredResult, type SessionMode, type Status, type TestId as TestIdT } from '@visus/shared';
import { z } from 'zod';

import { geminiJson } from '../../lib/gemini';
import { toTranscript, userText } from '../../lib/intake';
import { canAdd, type Added } from '../rules/next-test';
import { intakeRedFlag } from '../rules/red-flags';
import { INTAKE_PROMPT, PLAN_PROMPT, REPLAN_PROMPT, VERDICT_PROMPT } from './prompts';

type Person = Pick<Profile, 'age' | 'isChild' | 'screenHoursPerDay' | 'wearsGlasses' | 'healthConditions'>;
type PlanItem = { testId: TestIdT; reason: string };
export type Plan = { summary: string; plan: PlanItem[] };

export const REASONS: Record<TestIdT, string> = {
  tumbling_e: 'Sharpness of far-away detail',
  clock_dial: 'Can make lights streak at night',
  amsler: 'Checks for wavy or missing lines',
  contrast: 'Night blur often starts here',
  near_reading: 'Small print up close',
  near_point: 'How close your eyes can focus',
  duochrome: 'Checks if your focus is a little off',
  peripheral_field: 'Notices what is around you',
  colour_plates: 'Tells colours apart',
  risk_screener: 'Health and family risk factors',
  eye_strain: 'Screens and tired eyes',
  glare_night: 'Halos and glare from headlights',
  kids_tumbling_e: 'Sharpness of far-away detail',
  kids_colour_shapes: 'Tells colours apart',
};

const item = (testId: TestIdT, reason = REASONS[testId]): PlanItem => ({ testId, reason });
const isKid = (p: Person) => p.isChild || p.age < 13;
/** Adult tests this person is old enough for. */
const allowedFor = (p: Person) => TEST_CATALOG.filter((t) => t.category !== 'kids' && p.age >= t.minAge).map((t) => t.id);

const describe = (p: Person) =>
  `Age ${p.age}. ${p.wearsGlasses ? 'Wears glasses or contacts.' : 'No glasses.'} Screen time ${p.screenHoursPerDay} h/day.${
    p.healthConditions.length ? ` Health: ${p.healthConditions.join(', ')}.` : ''
  }`;

const URGENT_SUMMARY = 'Please see an eye doctor soon about what you described.';

// ---------- Intake chat ----------

/** Follow-up questions after the first message. The AI asks its own; these are the fallback. */
const MAX_QUESTIONS = 3;
const FALLBACK_QUESTIONS: [string, string[]][] = [
  ['Is it in both eyes, or one more than the other?', ['Both eyes', 'Mostly left', 'Mostly right']],
  ['How long has it been happening?', ['A few days', 'A few weeks', 'Months or more']],
  ['Any pain, redness or flashes of light?', ['None of those', 'Some discomfort', 'Yes, flashes']],
];
const URGENT_NOTE = 'If this started suddenly or is getting worse, please see an eye doctor today.';
const DONE: IntakeChatResponse = { reply: '', chips: [], done: true };

/** One turn of Issue intake (9): Gemini's next question with chips, or done (then POST /sessions plans). */
export async function intakeTurn(input: { messages: IntakeMessage[]; person: Person; apiKey: string }): Promise<IntakeChatResponse> {
  const { messages, person } = input;
  const answered = messages.filter((m) => m.from === 'me').length - 1; // follow-ups answered after the first message
  if (answered < 0) return { reply: "What's bothering your eyes today?", chips: [], done: false };
  if (answered >= MAX_QUESTIONS) return DONE;

  const transcript = toTranscript(messages);
  const ai = await geminiJson({
    apiKey: input.apiKey,
    system: INTAKE_PROMPT,
    prompt: `Allowed tests for this person: ${allowedFor(person).join(', ')}\nPerson: ${describe(person)}\nFollow-up questions asked so far: ${answered} of at most ${MAX_QUESTIONS}.\n\nChat so far:\n"""${transcript.slice(-3000)}"""\n\nWrite your next turn.`,
    schema: z.object({ reply: z.string().max(300), chips: z.array(z.string().max(40)).max(6), done: z.boolean() }),
  });
  const fallback = FALLBACK_QUESTIONS[answered];
  let turn: IntakeChatResponse;
  if (ai?.done && answered >= 1) turn = DONE;
  else if (ai && !ai.done && ai.reply.trim()) turn = { reply: ai.reply.trim(), chips: ai.chips.map((c) => c.trim()).filter(Boolean).slice(0, 4), done: false };
  else turn = fallback ? { reply: fallback[0], chips: fallback[1], done: false } : DONE;

  // Rules, not the AI: urgent symptoms get a doctor note once.
  const warned = messages.some((m) => m.from === 'ai' && m.text.includes(URGENT_NOTE));
  if (!turn.done && !warned && intakeRedFlag(transcript)) turn = { ...turn, reply: `${URGENT_NOTE} ${turn.reply}` };
  return turn;
}

// ---------- Plan ----------

/** Fixed plans for every mode except an adult's full check. */
export async function planTests(input: { mode: SessionMode; testId?: TestIdT; intake: string; person: Person; apiKey: string }): Promise<Plan> {
  const { mode, person } = input;
  if (mode === 'single') return { summary: 'The test you picked.', plan: [item(input.testId!)] };
  if (mode === 'glasses')
    return {
      summary: 'Distance acuity twice: without, then with your glasses.',
      plan: [item('tumbling_e', 'Round 1: without your glasses'), item('tumbling_e', 'Round 2: with your glasses on')],
    };
  if (mode === 'quick') return { summary: 'Three fast tests for a quick read on your eyes.', plan: [item('tumbling_e'), item('amsler'), item('clock_dial')] };
  if (isKid(person)) return { summary: 'Kids tests, done together with a parent.', plan: [item('kids_tumbling_e'), item('kids_colour_shapes')] };
  return (await aiPlan(input.intake, person, input.apiKey)) ?? rulePlan(input.intake, person);
}

async function aiPlan(intake: string, person: Person, apiKey: string): Promise<Plan | null> {
  const allowed = allowedFor(person);
  const schema = z.object({
    summary: z.string().min(1).max(300),
    plan: z
      .array(z.object({ testId: z.enum(allowed as [TestIdT, ...TestIdT[]]), reason: z.string().min(1).max(80) }))
      .min(2)
      .max(6),
  });
  const reply = await geminiJson({
    apiKey,
    system: PLAN_PROMPT,
    prompt: `Allowed tests for this person: ${allowed.join(', ')}\nPerson: ${describe(person)}\n\nChat:\n"""${intake.slice(0, 3000) || '(nothing, plan a general check)'}"""`,
    schema,
  });
  if (!reply) return null;
  const plan = reply.plan.filter((p, i) => reply.plan.findIndex((q) => q.testId === p.testId) === i).slice(0, 5);
  // Red flags come from the rules, not the AI alone.
  const urgent = intakeRedFlag(intake);
  if (urgent && !plan.some((p) => p.testId === 'amsler')) plan.splice(1, 0, item('amsler'));
  const summary = urgent ? `${URGENT_SUMMARY} ${reply.summary.split(/(?<=\.)\s+/).filter((s) => !/eye doctor/i.test(s)).join(' ')}`.trim() : reply.summary;
  return { summary, plan };
}

/** Keyword plan used when Gemini is unavailable. */
const KEYWORDS: [RegExp, TestIdT[], string][] = [
  [/night|headlight|glare|halo|dark|driv/i, ['contrast', 'glare_night'], 'trouble at night'],
  [/read|close|near|phone|small print|book|menu/i, ['near_reading', 'near_point'], 'reading up close'],
  [/screen|laptop|computer|tired|strain|headache|dry|burn/i, ['eye_strain'], 'tired eyes'],
  [/wavy|bent|distort|straight line|cent(re|er)|missing/i, ['amsler'], 'wavy lines'],
  [/colou?r/i, ['colour_plates'], 'colours'],
  [/side|bump|peripheral|tunnel|edge/i, ['peripheral_field'], 'side vision'],
  [/double|ghost|streak|smear|astigmat/i, ['clock_dial'], 'streaks or ghosting'],
  [/diabet|glaucoma|family|pressure|smok/i, ['risk_screener'], 'health risks'],
];

export function rulePlan(transcript: string, person: Person): Plan {
  const intake = userText(transcript);
  const allowed = allowedFor(person);
  const tests: TestIdT[] = ['tumbling_e'];
  const concerns: string[] = [];
  const urgent = intakeRedFlag(intake);
  if (urgent) tests.push('amsler');
  for (const [re, ids, label] of KEYWORDS) {
    if (!re.test(intake)) continue;
    concerns.push(label);
    for (const id of ids) if (!tests.includes(id)) tests.push(id);
  }
  for (const id of ['clock_dial', 'amsler', 'contrast'] as TestIdT[]) if (tests.length < 4 && !tests.includes(id)) tests.push(id);
  const plan = tests.filter((id) => allowed.includes(id)).slice(0, 5).map((id) => item(id));
  const why = concerns.length ? `Based on what you described: ${concerns.slice(0, 3).join(', ')}.` : 'A general check of sharpness, focus and eye health.';
  return { summary: urgent ? `${URGENT_SUMMARY} ${why}` : why, plan };
}

// ---------- Re-plan ----------

/** Asks Gemini if one extra test would help after an unclear result. null = no extra test. */
export async function aiReplan(input: { result: ScoredResult; taken: TestIdT[]; intake: string; person: Person; apiKey: string }): Promise<Added | null> {
  const allowed = allowedFor(input.person).filter((id) => canAdd(id, input.taken, input.person.age));
  if (!allowed.length) return null;
  const schema = z.object({ testId: z.enum(['none', ...allowed] as [string, ...string[]]), reason: z.string().max(120) });
  const reply = await geminiJson({
    apiKey: input.apiKey,
    system: REPLAN_PROMPT,
    prompt: `Allowed tests to add: ${allowed.join(', ')}\nAlready planned or done: ${input.taken.join(', ')}\nPerson: ${describe(
      input.person,
    )}\nWhat they said: """${userText(input.intake).slice(0, 800)}"""\n\nResult just now: ${input.result.testId}, status ${input.result.status}, score ${input.result.score}: ${input.result.summary}`,
    schema,
  });
  if (!reply || reply.testId === 'none') return null;
  const testId = TestId.parse(reply.testId);
  return { testId, reason: REASONS[testId] }; // our wording: the AI's reason can drift from the test
}

// ---------- Verdict ----------

const RANK: Record<Status, number> = { good: 0, mild: 1, see_doctor: 2 };

export function ruleVerdictText(results: ScoredResult[]) {
  const overall = results.reduce<Status>((s, r) => (RANK[r.status] > RANK[s] ? r.status : s), 'good');
  const worst = [...results].sort((a, b) => RANK[b.status] - RANK[a.status])[0];
  if (overall === 'see_doctor')
    return { headline: 'One thing to follow up with a doctor', advice: `Book an eye doctor this week and show them this report. ${worst.summary}.` };
  if (overall === 'mild')
    return { headline: 'Mostly healthy, a few small changes', advice: `Check again in 3 months, or see an optician sooner if things change. ${worst.summary}.` };
  return { headline: 'Your eyes look healthy', advice: 'Check again in 6 months.' };
}

export async function verdictText(input: { results: ScoredResult[]; intake: string; person: Person; apiKey: string }) {
  const fallback = ruleVerdictText(input.results);
  if (!input.results.length) return fallback;
  const schema = z.object({ headline: z.string().min(3).max(70), advice: z.string().min(10).max(320) });
  const reply = await geminiJson({
    apiKey: input.apiKey,
    system: VERDICT_PROMPT,
    prompt: `Person: ${describe(input.person)}\nWhat they said: """${userText(input.intake).slice(0, 800)}"""\n\nResults:\n${input.results
      .map((r) => `- ${r.testId}: ${r.status}, score ${r.score}. ${r.summary}`)
      .join('\n')}`,
    schema,
  });
  if (!reply) return fallback;
  // The rules decide how serious it is: a doctor finding must say so.
  if (input.results.some((r) => r.status === 'see_doctor') && !/doctor/i.test(reply.advice)) return fallback;
  return reply;
}
