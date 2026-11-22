// Add to calendar (remote consult): the event goes straight into the phone's calendar with alarms
// 1 hour and 10 minutes before (expo-calendar). Where that isn't possible (no writable calendar,
// permission refused, Expo Go), the Google Calendar link opens instead.
import { Linking } from 'react-native';

import type { ConsultSummary } from '@/services/consults';

export type CalendarResult = 'added' | 'opened_link' | 'denied';

const drName = (name: string) => (/^dr\.?\s/i.test(name) ? name : `Dr ${name}`);

export async function addConsultToCalendar(c: ConsultSummary): Promise<CalendarResult> {
  try {
    // Loaded on first use: native module (installed app).
    const Calendar = await import('expo-calendar');
    const permission = await Calendar.requestCalendarPermissions();
    if (!permission.granted) return 'denied';
    const calendars = (await Calendar.getCalendars()).filter((cal) => cal.allowsModifications);
    const target = calendars.find((cal) => cal.isPrimary) ?? calendars[0];
    if (!target) throw new Error('No writable calendar');
    const start = new Date(c.startsAt);
    await target.createEvent({
      title: `Eye consult with ${drName(c.doctor.name)}`,
      startDate: start,
      endDate: new Date(start.getTime() + c.minutes * 60_000),
      location: c.joinFrom === 'clinic' ? `${c.clinic.name}, ${c.clinic.city} (video call)` : 'Video call in the Visus app',
      notes: [c.reason && `Reason: ${c.reason}`, 'Open the Visus app and tap Join now. Visus is a screening, not a diagnosis.'].filter(Boolean).join('\n'),
      alarms: [{ relativeOffset: -60 }, { relativeOffset: -10 }],
    });
    return 'added';
  } catch {
    await Linking.openURL(c.calendar.googleUrl);
    return 'opened_link';
  }
}
