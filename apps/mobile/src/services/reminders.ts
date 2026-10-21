// On-device reminders (local notifications; no server). Push is not used.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHECK_ID = 'visus-check-reminder';
const CHANNEL = 'reminders';

// Show the reminder even when the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

/** Asks for permission if needed. False when the user said no. */
async function allowed() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/** Monthly "time for your eye check" on today's day of the month (max 28th), 10:00. */
export async function enableCheckReminder(): Promise<boolean> {
  if (!(await allowed())) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, { name: 'Reminders', importance: Notifications.AndroidImportance.DEFAULT });
  }
  await Notifications.cancelScheduledNotificationAsync(CHECK_ID);
  await Notifications.scheduleNotificationAsync({
    identifier: CHECK_ID,
    content: { title: 'Time for your eye check', body: 'It takes about 5 minutes. Screening, not diagnosis.' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
      channelId: CHANNEL,
      day: Math.min(new Date().getDate(), 28),
      hour: 10,
      minute: 0,
    },
  });
  return true;
}

export async function disableCheckReminder() {
  await Notifications.cancelScheduledNotificationAsync(CHECK_ID);
}
