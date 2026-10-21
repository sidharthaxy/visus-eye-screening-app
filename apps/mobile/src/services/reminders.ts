// On-device reminders (local notifications; no server). Push is not used.
// expo-notifications is loaded only where it exists: Expo Go on Android has no notifications
// module since SDK 53 (importing it throws), so reminders there are 'unavailable'.
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

type Notifications = typeof import('expo-notifications');
/** 'denied': the user said no. 'unavailable': this app build can't show notifications (Expo Go on Android). */
export type ReminderResult = 'on' | 'denied' | 'unavailable';

const CHECK_ID = 'visus-check-reminder';
const CHANNEL = 'reminders';

export const remindersAvailable = !(Platform.OS === 'android' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient);

let loading: Promise<Notifications | null> | undefined;
function load() {
  loading ??= remindersAvailable
    ? import('expo-notifications').then(
        (N) => {
          // Show the reminder even when the app is open.
          N.setNotificationHandler({
            handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
          });
          return N;
        },
        () => null,
      )
    : Promise.resolve(null);
  return loading;
}

/** The module once permission is granted (asks if needed), or why not. */
async function ready(): Promise<Notifications | Exclude<ReminderResult, 'on'>> {
  const N = await load();
  if (!N) return 'unavailable';
  const current = await N.getPermissionsAsync();
  if (!current.granted && !(await N.requestPermissionsAsync()).granted) return 'denied';
  if (Platform.OS === 'android') await N.setNotificationChannelAsync(CHANNEL, { name: 'Reminders', importance: N.AndroidImportance.DEFAULT });
  return N;
}

/** Monthly "time for your eye check" on today's day of the month (max 28th), 10:00. */
export async function enableCheckReminder(): Promise<ReminderResult> {
  const N = await ready();
  if (typeof N === 'string') return N;
  await N.cancelScheduledNotificationAsync(CHECK_ID);
  await N.scheduleNotificationAsync({
    identifier: CHECK_ID,
    content: { title: 'Time for your eye check', body: 'It takes about 5 minutes. Screening, not diagnosis.' },
    trigger: { type: N.SchedulableTriggerInputTypes.MONTHLY, channelId: CHANNEL, day: Math.min(new Date().getDate(), 28), hour: 10, minute: 0 },
  });
  return 'on';
}

/** Re-check reminder (56) "Remind me in a week": one notification on that day at 10:00. */
export async function remindRecheckOn(date: Date): Promise<ReminderResult> {
  const N = await ready();
  if (typeof N === 'string') return N;
  const at = new Date(date);
  at.setHours(10, 0, 0, 0);
  await N.scheduleNotificationAsync({
    identifier: 'visus-recheck',
    content: { title: 'Time to re-check your eyes', body: 'A 5-minute check keeps your record up to date.' },
    trigger: { type: N.SchedulableTriggerInputTypes.DATE, channelId: CHANNEL, date: at },
  });
  return 'on';
}

export async function disableCheckReminder() {
  const N = await load();
  await N?.cancelScheduledNotificationAsync(CHECK_ID);
}

/** Shown when reminders can't run in this build. */
export const UNAVAILABLE_NOTE = "Reminders need the installed Visus app. They don't run inside Expo Go on Android.";
