import type { Profile } from '@visus/shared';

import type { NewProfile } from '@/services/profiles';

let nextId = 1;

export function mockCreateProfile(input: NewProfile): Profile {
  return { id: `profile-${nextId++}`, ...input };
}

/** Used after Log in, when onboarding didn't run in this app session. */
export function mockDefaultProfile(name: string): Profile {
  return {
    id: 'profile-me',
    name,
    age: 34,
    isChild: false,
    wearsGlasses: true,
    healthConditions: [],
    screenHoursPerDay: 7,
  };
}
