import { mockDelay, USE_MOCK } from '@/services/api';
import { mockScreenTime } from '@/services/mock/coach';
import { getMyProfile } from '@/services/profiles';

/** `device`: measured on this phone (Screen Coach, development build). `profile`: what the user told us in onboarding. */
export type ScreenTime = { minutes: number; goalMinutes: number; source: 'device' | 'profile' };

const GOAL_MINUTES = 6 * 60;

/**
 * Screen time. Measured by the Screen Coach native module once it exists (Phase 3, not in Expo Go);
 * until then the daily hours from the owner's profile.
 */
export async function getScreenTimeToday(): Promise<ScreenTime> {
  if (USE_MOCK) return mockDelay(mockScreenTime());
  const profile = await getMyProfile();
  return { minutes: Math.round(profile.screenHoursPerDay * 60), goalMinutes: GOAL_MINUTES, source: 'profile' };
}
