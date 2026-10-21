import type { Profile } from '@visus/shared';

import type { NewProfile } from '@/services/profiles';

let nextId = 1;
/** This account's profiles, owner first. */
const profiles: Profile[] = [];

/** The owner if onboarding didn't run in this app session (e.g. after Log in). */
const defaultOwner = (name: string): Profile => ({
  id: 'profile-me',
  name,
  age: 34,
  gender: 'Female',
  isChild: false,
  wearsGlasses: true,
  healthConditions: [],
  screenHoursPerDay: 5,
  relation: 'self',
  eyewear: 'glasses',
  pastEyeTest: 'yes',
});

/** GET /me */
export function mockProfiles(name: string): Profile[] {
  if (profiles.length === 0) profiles.push(defaultOwner(name));
  return [...profiles];
}

/** One profile, e.g. to give a child's check the kids tests. */
export const mockProfile = (id: string) => profiles.find((p) => p.id === id);

/** The owner's id, for past checks in the mock history. */
export const mockOwnerId = () => profiles[0]?.id ?? 'profile-me';

/** POST /profiles: the first profile is the owner. */
export function mockCreateProfile(input: NewProfile): Profile {
  const profile: Profile = { id: `profile-${nextId++}`, ...input, relation: input.relation ?? (profiles.length ? 'other' : 'self') };
  profiles.push(profile);
  return profile;
}

/** PATCH /profiles/:id */
export function mockUpdateProfile(id: string, patch: Partial<NewProfile>): Profile {
  const at = profiles.findIndex((p) => p.id === id);
  if (at < 0) throw new Error('Profile not found');
  profiles[at] = { ...profiles[at], ...patch };
  return profiles[at];
}
