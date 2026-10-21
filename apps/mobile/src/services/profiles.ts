import type { Profile } from '@visus/shared';

import { ApiError, mockDelay, request, USE_MOCK } from '@/services/api';
import { currentUser } from '@/services/auth';
import { mockCreateProfile, mockProfiles, mockUpdateProfile } from '@/services/mock/profiles';
import { useAuth } from '@/store/auth';

export type NewProfile = Omit<Profile, 'id'>;

// Profiles of this account, owner first, once loaded. Kept per login token, so another account never sees them.
let cache: Profile[] | null = null;
let cacheToken: string | null = null;

/** GET /me: the account's profiles, owner first. */
export async function listProfiles(): Promise<Profile[]> {
  const token = useAuth.getState().token;
  if (cache && cacheToken === token) return cache;
  const list = USE_MOCK ? await mockDelay(mockProfiles(currentUser()?.name ?? 'Asha'), 200) : (await request<{ profiles: Profile[] }>('/me')).profiles;
  cache = list;
  cacheToken = token;
  return list;
}

/** The account owner's profile. */
export async function getMyProfile(): Promise<Profile> {
  const owner = (await listProfiles())[0];
  if (!owner) throw new ApiError(0, 'Finish setting up your profile first.');
  return owner;
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
