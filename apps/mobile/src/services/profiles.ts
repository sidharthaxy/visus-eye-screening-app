import type { Profile } from '@visus/shared';

import { mockDelay, request, USE_MOCK } from '@/services/api';
import { currentUser } from '@/services/auth';
import { mockCreateProfile, mockDefaultProfile } from '@/services/mock/profiles';

export type NewProfile = Omit<Profile, 'id'>;

// The account owner's own profile, once known.
let mine: Profile | null = null;

/** POST /profiles */
export async function createProfile(input: NewProfile): Promise<Profile> {
  const profile = USE_MOCK ? await mockDelay(mockCreateProfile(input)) : await request<Profile>('/profiles', { method: 'POST', body: input });
  mine ??= profile;
  return profile;
}

/** The account owner's profile (first profile from GET /me). */
export async function getMyProfile(): Promise<Profile> {
  if (mine) return mine;
  if (USE_MOCK) mine = await mockDelay(mockDefaultProfile(currentUser()?.name ?? 'Asha'), 200);
  else mine = (await request<{ profiles: Profile[] }>('/me')).profiles[0];
  return mine;
}
