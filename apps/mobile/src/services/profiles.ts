import type { Profile } from '@visus/shared';

import { mockDelay, request, USE_MOCK } from '@/services/api';
import { currentUser } from '@/services/auth';
import { mockCreateProfile, mockProfiles, mockUpdateProfile } from '@/services/mock/profiles';

export type NewProfile = Omit<Profile, 'id'>;

// Profiles of this account, owner first, once loaded.
let cache: Profile[] | null = null;

/** GET /me: the account's profiles, owner first. */
export async function listProfiles(): Promise<Profile[]> {
  if (cache) return cache;
  if (USE_MOCK) cache = await mockDelay(mockProfiles(currentUser()?.name ?? 'Asha'), 200);
  else cache = (await request<{ profiles: Profile[] }>('/me')).profiles;
  return cache;
}

/** The account owner's profile. */
export async function getMyProfile(): Promise<Profile> {
  return (await listProfiles())[0];
}

/** POST /profiles: the owner (onboarding) or a family member. */
export async function createProfile(input: NewProfile): Promise<Profile> {
  const profile = USE_MOCK ? await mockDelay(mockCreateProfile(input)) : await request<Profile>('/profiles', { method: 'POST', body: input });
  cache = null;
  return profile;
}

/** PATCH /profiles/:id */
export async function updateProfile(id: string, patch: Partial<NewProfile>): Promise<Profile> {
  const profile = USE_MOCK
    ? await mockDelay(mockUpdateProfile(id, patch))
    : await request<Profile>(`/profiles/${id}`, { method: 'PATCH', body: patch });
  cache = null;
  return profile;
}

/** After log out: the next account loads its own profiles. */
export function forgetProfiles() {
  cache = null;
}
