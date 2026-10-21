// Screen Coach (7, 21, 22, 23): screen time and break reminders from the Android native module
// (`modules/screen-coach`). The module only exists in the development build, not in Expo Go.
import { AppState } from 'react-native';

import ScreenCoach, { type CoachStatus, type DayBreaks, type DayMinutes } from '../../modules/screen-coach/src/ScreenCoachModule';
import { mockDelay, USE_MOCK } from '@/services/api';
import { mockScreenTime } from '@/services/mock/coach';
import { getMyProfile } from '@/services/profiles';
import { useSettings } from '@/store/settings';

export type { CoachStatus, DayBreaks, DayMinutes };

/** `device`: measured on this phone. `profile`: what the user told us in onboarding (no usage access, or Expo Go). */
export type ScreenTime = { minutes: number; goalMinutes: number; source: 'device' | 'profile' };

/** True in the Android development build / APK, false in Expo Go. */
export const coachAvailable = ScreenCoach !== null;

/** 6h goal, or a 2h limit in child mode. */
export const goalMinutes = () => (useSettings.getState().coach.childMode ? 120 : 360);

export const hasUsageAccess = () => ScreenCoach?.hasUsageAccess() ?? false;
export const canDrawOverlays = () => ScreenCoach?.canDrawOverlays() ?? false;
export const openUsageAccessSettings = () => ScreenCoach?.openUsageAccessSettings();
export const openOverlaySettings = () => ScreenCoach?.openOverlaySettings();

/** Today's screen time: measured when usage access is on, otherwise the profile's daily hours. */
export async function getScreenTimeToday(): Promise<ScreenTime> {
  if (USE_MOCK) return mockDelay(mockScreenTime());
  if (ScreenCoach && ScreenCoach.hasUsageAccess()) {
    const days = await ScreenCoach.getScreenTime(1);
    return { minutes: days[days.length - 1]?.minutes ?? 0, goalMinutes: goalMinutes(), source: 'device' };
  }
  const profile = await getMyProfile();
  return { minutes: Math.round(profile.screenHoursPerDay * 60), goalMinutes: goalMinutes(), source: 'profile' };
}

/** Screen-on minutes per day, oldest first (today last). Empty without the module or usage access. */
export async function getScreenTimeDays(days: number): Promise<DayMinutes[]> {
  if (!ScreenCoach || !ScreenCoach.hasUsageAccess()) return [];
  return ScreenCoach.getScreenTime(days);
}

/** Breaks taken / skipped per day, oldest first. */
export async function getBreakDays(days: number): Promise<DayBreaks[]> {
  return ScreenCoach ? ScreenCoach.getBreaks(days) : [];
}

export function getCoachStatus(): CoachStatus | null {
  return ScreenCoach?.getStatus() ?? null;
}

/** Break reminders on (every `intervalMin` minutes of continuous screen time) or off. */
export function setBreakReminders(on: boolean) {
  if (!ScreenCoach) return;
  if (on) ScreenCoach.start(useSettings.getState().coach.intervalMin);
  else ScreenCoach.stop();
  useSettings.getState().setReminder('breaks', on);
}

/** Shows the break overlay now, to try it. */
export const showBreakNow = () => ScreenCoach?.showBreakNow();

/** Calls `fn` when the app comes back to the front (e.g. after granting a permission in Settings). */
export function onAppActive(fn: () => void) {
  const sub = AppState.addEventListener('change', (state) => state === 'active' && fn());
  return () => sub.remove();
}
