import { NativeModule, requireOptionalNativeModule } from 'expo';

export type DayMinutes = { date: string; minutes: number };
export type DayBreaks = { date: string; taken: number; skipped: number };
export type CoachStatus = { enabled: boolean; running: boolean; intervalMin: number; secondsToBreak: number };

declare class ScreenCoachModule extends NativeModule<Record<string, never>> {
  hasUsageAccess(): boolean;
  openUsageAccessSettings(): void;
  canDrawOverlays(): boolean;
  openOverlaySettings(): void;
  getScreenTime(days: number): Promise<DayMinutes[]>;
  getBreaks(days: number): Promise<DayBreaks[]>;
  start(intervalMin: number): void;
  stop(): void;
  getStatus(): CoachStatus;
  showBreakNow(): void;
}

/** null in Expo Go and on iOS/web: Screen Coach needs the Android development build. */
export default requireOptionalNativeModule<ScreenCoachModule>('ScreenCoach');
