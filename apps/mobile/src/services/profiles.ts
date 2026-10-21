import type { Profile } from '@visus/shared';

import { mockDelay, request, USE_MOCK } from '@/services/api';
import { mockCreateProfile } from '@/services/mock/profiles';

export type NewProfile = Omit<Profile, 'id'>;

/** POST /profiles */
export async function createProfile(input: NewProfile): Promise<Profile> {
  if (USE_MOCK) return mockDelay(mockCreateProfile(input));
  return request<Profile>('/profiles', { method: 'POST', body: input });
}
