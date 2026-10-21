import { mockDelay } from '@/services/api';
import { mockScreenTime } from '@/services/mock/coach';

export type ScreenTime = { minutes: number; goalMinutes: number };

/** Today's screen time. Comes from the Screen Coach native module (Phase 3); mock until then. */
export async function getScreenTimeToday(): Promise<ScreenTime> {
  return mockDelay(mockScreenTime());
}
