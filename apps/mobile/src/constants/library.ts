// Tests library filter (52) and search (53): problem tags and search words per test, from the design.
import { TEST_CATALOG, type TestId, type TestInfo } from '@visus/shared';

import { CATEGORIES } from '@/constants/tests';

export type Problem = 'far' | 'near' | 'strain' | 'glare' | 'colour' | 'wavy';

export const PROBLEMS: [Problem, string][] = [
  ['far', 'Blurry far'],
  ['near', 'Blurry near'],
  ['strain', 'Eye strain'],
  ['glare', 'Night glare'],
  ['colour', 'Colour'],
  ['wavy', 'Wavy lines'],
];

/** Which problems each test helps with. */
const TAGS: Record<TestId, Problem[]> = {
  tumbling_e: ['far'],
  near_reading: ['near'],
  near_point: ['near', 'strain'],
  clock_dial: ['far'],
  duochrome: ['far'],
  amsler: ['wavy'],
  contrast: ['far', 'glare'],
  peripheral_field: [],
  colour_plates: ['colour'],
  risk_screener: ['wavy'],
  eye_strain: ['strain'],
  glare_night: ['glare'],
  kids_tumbling_e: ['far'],
  kids_colour_shapes: ['colour'],
};

/** Everyday words people search with, per problem. */
const WORDS: Record<Problem, string> = {
  far: 'blurry far distance signs sharp',
  near: 'blurry near reading close',
  strain: 'strain tired screens headache',
  glare: 'night glare driving headlights',
  colour: 'colour color',
  wavy: 'wavy lines distortion',
};

export type Filters = { problems: Problem[]; age: 0 | 1 | 2; type: 0 | 1 | 2; time: 0 | 1 | 2 };
export const NO_FILTERS: Filters = { problems: [], age: 0, type: 0, time: 0 };
export const AGE = ['All ages', 'Adults', 'Kids'];
export const TYPE = ['Any', 'Interactive', 'Questionnaire'];
export const TIME = ['Any', 'Up to 2 min', 'Up to 3 min'];

export const hasFilters = (f: Filters) => f.problems.length > 0 || f.age > 0 || f.type > 0 || f.time > 0;

export function filterTests(f: Filters): TestInfo[] {
  return TEST_CATALOG.filter((t) => {
    const kids = t.category === 'kids';
    return (
      (f.problems.length === 0 || TAGS[t.id].some((p) => f.problems.includes(p))) &&
      (f.age === 0 || (f.age === 1 ? !kids : kids)) &&
      (f.type === 0 || t.kind === (f.type === 1 ? 'visual' : 'questionnaire')) &&
      (f.time === 0 || t.minutes <= (f.time === 1 ? 2 : 3))
    );
  });
}

/** Tests whose name, group or problem words contain the query. */
export function searchTests(query: string): TestInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) return TEST_CATALOG;
  return TEST_CATALOG.filter((t) => {
    const group = CATEGORIES.find((c) => c.id === t.category)?.tile ?? '';
    return `${t.name} ${group} ${TAGS[t.id].map((p) => WORDS[p]).join(' ')}`.toLowerCase().includes(q);
  });
}
