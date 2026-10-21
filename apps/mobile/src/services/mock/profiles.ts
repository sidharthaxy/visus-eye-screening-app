import type { Profile } from '@visus/shared';

import type { NewProfile } from '@/services/profiles';

let nextId = 1;

export function mockCreateProfile(input: NewProfile): Profile {
  return { id: `profile-${nextId++}`, ...input };
}
