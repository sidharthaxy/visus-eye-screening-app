// Answer lists shared by Onboarding, Edit profile, Add family member and Profile.
import type { Eyewear, Profile, Relation } from '@visus/shared';

export const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

export const EYEWEAR: [Eyewear, string][] = [
  ['glasses', 'Glasses'],
  ['contacts', 'Contact lenses'],
  ['both', 'Both'],
  ['none', 'Neither'],
];

export const PAST: [NonNullable<Profile['pastEyeTest']>, string][] = [
  ['yes', 'Yes'],
  ['no', 'No'],
  ['not_sure', 'Not sure'],
];

export const NONE = 'None of these';
export const CONDITIONS = ['Diabetes', 'High blood pressure', 'Thyroid', 'Migraines', 'Dry eyes', 'Allergies', 'Other', NONE];

/** Screen-time answer ↔ hours per day in the profile. */
export const SCREEN_TIME: [string, number][] = [
  ['Under 2 hours', 1],
  ['2–4 hours', 3],
  ['4–6 hours', 5],
  ['6–8 hours', 7],
  ['More than 8 hours', 9],
];
export const screenLabel = (hours: number) =>
  SCREEN_TIME.reduce((best, cur) => (Math.abs(cur[1] - hours) < Math.abs(best[1] - hours) ? cur : best))[0];

/** Family relations (Add family member); "self" is the account owner. */
export const RELATIONS: [Exclude<Relation, 'self'>, string][] = [
  ['child', 'Child'],
  ['partner', 'Partner'],
  ['parent', 'Parent'],
  ['sibling', 'Sibling'],
  ['other', 'Other'],
];

/** "AS" for "Asha Sharma". */
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

/** Toggles a health condition; "None of these" clears the others. */
export function toggleCondition(list: string[], value: string) {
  if (value === NONE) return list.includes(NONE) ? [] : [NONE];
  const rest = list.filter((c) => c !== NONE);
  return rest.includes(value) ? rest.filter((c) => c !== value) : [...rest, value];
}

/** "−1.25" with a real minus sign, "+2.00", "0.00". */
export const formatPower = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(2)}`;
