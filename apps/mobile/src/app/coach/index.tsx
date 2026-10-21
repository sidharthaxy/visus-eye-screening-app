import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Switch } from '@/components/Form';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { dayLetter, hm } from '@/constants/coach';
import { Colors, Fonts, Radius, StatusColors } from '@/constants/theme';
import {
  canDrawOverlays,
  coachAvailable,
  getBreakDays,
  getCoachStatus,
  getScreenTimeDays,
  goalMinutes,
  hasUsageAccess,
  onAppActive,
  openUsageAccessSettings,
  setBreakReminders,
  showBreakNow,
  type CoachStatus,
  type DayMinutes,
} from '@/services/coach';
import { useSettings } from '@/store/settings';

const BREAK_GOAL = 8;

/** Screen 7: Screen Coach. Screen time today, breaks, reminder settings and the last 7 days. */
export default function Coach() {
  const coach = useSettings((s) => s.coach);
  const setCoach = useSettings((s) => s.setCoach);
  const [usage, setUsage] = useState(hasUsageAccess);
  const [week, setWeek] = useState<DayMinutes[]>([]);
  const [taken, setTaken] = useState(0);
  const [status, setStatus] = useState<CoachStatus | null>(getCoachStatus);

  const load = useCallback(() => {
    setUsage(hasUsageAccess());
    setStatus(getCoachStatus());
    getScreenTimeDays(7).then(setWeek, () => setWeek([]));
    getBreakDays(1).then((b) => setTaken(b[0]?.taken ?? 0), () => undefined);
  }, []);
  useFocusEffect(load);
  useEffect(() => onAppActive(load), [load]);
  // "Next break in" counts down live.
  useEffect(() => {
    const timer = setInterval(() => setStatus(getCoachStatus()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!coachAvailable) {
    return (
      <Screen scroll>
        <ScreenHeader left="back" onLeft={() => router.back()} title="Screen Coach" />
        <View style={[styles.card, styles.first]}>
          <Text style={styles.cardTitle}>Needs the installed Visus app</Text>
          <Text style={styles.body}>
            Screen Coach counts your screen time and reminds you to rest your eyes. It runs in the installed Android app, not inside Expo Go.
          </Text>
        </View>
      </Screen>
    );
  }

  const goal = goalMinutes();
  const today = week[week.length - 1]?.minutes ?? 0;
  const over = today > goal;
  const on = status?.enabled ?? false;
  const seconds = status?.secondsToBreak ?? coach.intervalMin * 60;
  const max = Math.max(goal, ...week.map((d) => d.minutes), 1);
  const avg = week.length ? week.reduce((n, d) => n + d.minutes, 0) / week.length : 0;

  function toggle(value: boolean) {
    // The reminder shows on top of other apps: ask for that first.
    if (value && !canDrawOverlays()) return router.push('/coach/permission');
    setBreakReminders(value);
    setStatus(getCoachStatus());
  }
  function interval(min: 15 | 20) {
    if (!on) return;
    setCoach({ intervalMin: min });
    setBreakReminders(true); // restarts with the new interval
    setStatus(getCoachStatus());
  }

  return (
    <Screen scroll>
      <ScreenHeader left="back" onLeft={() => router.back()} title="Screen Coach" />

      <View style={[styles.card, styles.first]}>
        <Text style={styles.label}>Today</Text>
        {usage ? (
          <>
            <View style={styles.todayRow}>
              <Text style={styles.big}>{hm(today)}</Text>
              <Text style={styles.goal}>{coach.childMode ? 'of 2h limit' : 'of 6h goal'}</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.min(100, (today / goal) * 100)}%`, backgroundColor: over ? StatusColors.mild.dot : Colors.acc }]} />
            </View>
            <Text style={[styles.left, over && { color: StatusColors.mild.fg }]}>
              {hm(Math.abs(goal - today))} {over ? 'over the limit' : 'left today'}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.body}>Allow Usage access for Visus to count your screen time. Visus only reads the total, not what you do.</Text>
            <Button title="Turn on screen time" onPress={openUsageAccessSettings} style={styles.cardButton} />
          </>
        )}
      </View>

      <View style={styles.tiles}>
        <View style={[styles.card, styles.tile]}>
          <Text style={styles.tileLabel}>Breaks taken</Text>
          <Text style={styles.tileValue}>
            {taken} <Text style={styles.tileOf}>of {BREAK_GOAL}</Text>
          </Text>
          <View style={styles.dots}>
            {Array.from({ length: BREAK_GOAL }, (_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: i < taken ? Colors.acc : Colors.border }]} />
            ))}
          </View>
        </View>
        <View style={[styles.card, styles.tile]}>
          <Text style={styles.tileLabel}>Next break in</Text>
          <Text style={styles.tileValue}>{on ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : 'Off'}</Text>
          <Text style={styles.tileSub}>{on ? `Every ${status?.intervalMin ?? coach.intervalMin} min` : 'Reminders paused'}</Text>
        </View>
      </View>

      <View style={[styles.card, styles.list]}>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>Break reminders</Text>
          <Switch value={on} onChange={toggle} label="Break reminders" />
        </View>
        <View style={[styles.row, styles.divider, !on && styles.dim]}>
          <Text style={styles.rowTitle}>Remind me every</Text>
          <View style={styles.segments}>
            {([15, 20] as const).map((min) => (
              <Pressable
                key={min}
                accessibilityRole="tab"
                accessibilityState={{ selected: coach.intervalMin === min }}
                onPress={() => interval(min)}
                style={[styles.segment, coach.intervalMin === min && styles.segmentOn]}>
                <Text style={[styles.segmentText, coach.intervalMin === min && styles.segmentTextOn]}>{min} min</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={[styles.row, styles.rowTall, styles.divider]}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Child mode</Text>
            <Text style={styles.rowSub}>2h daily limit, gentler reminders</Text>
          </View>
          <Switch value={coach.childMode} onChange={(childMode) => setCoach({ childMode })} label="Child mode" />
        </View>
      </View>

      {usage && week.length > 0 && (
        <View style={[styles.card, styles.chartCard]}>
          <View style={styles.chartTop}>
            <Text style={styles.cardTitle}>Last 7 days</Text>
            <Text style={styles.rowSub}>Avg {hm(avg)}</Text>
          </View>
          <View style={styles.chart}>
            {week.map((d, i) => (
              <View
                key={d.date}
                style={[styles.bar, { height: Math.max(4, (d.minutes / max) * 72), backgroundColor: i === week.length - 1 ? Colors.ink : Colors.borderOption }]}
              />
            ))}
            <View style={[styles.goalLine, { bottom: (goal / max) * 72 }]} />
          </View>
          <View style={styles.days}>
            {week.map((d, i) => (
              <Text key={d.date} style={[styles.day, i === week.length - 1 && styles.dayToday]}>
                {dayLetter(d.date)}
              </Text>
            ))}
          </View>
        </View>
      )}

      <View style={[styles.card, styles.list]}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/coach/weekly')} style={styles.row}>
          <Icon name="calendar" size={20} strokeWidth={1.8} />
          <Text style={styles.rowTitle}>Weekly report</Text>
          <Icon name="chevronRight" size={16} color={Colors.faint} strokeWidth={2.2} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => (canDrawOverlays() ? showBreakNow() : router.push('/coach/permission'))}
          style={[styles.row, styles.divider]}>
          <Icon name="eye" size={20} strokeWidth={1.8} />
          <Text style={styles.rowTitle}>Try a break now</Text>
          <Icon name="chevronRight" size={16} color={Colors.faint} strokeWidth={2.2} />
        </Pressable>
      </View>

      <View style={styles.note}>
        <Icon name="shield" size={16} color={Colors.muted} strokeWidth={1.9} />
        <Text style={styles.noteText}>No camera, no recording. Only your screen-time total.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  first: { marginTop: 16 },
  card: { padding: 16, borderRadius: Radius.card, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  label: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.muted },
  cardTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.ink },
  body: { marginTop: 6, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: Colors.muted },
  cardButton: { marginTop: 14 },
  todayRow: { marginTop: 6, flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  big: { fontFamily: Fonts.bold, fontSize: 34, letterSpacing: -1, color: Colors.ink },
  goal: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.muted },
  track: { marginTop: 14, height: 8, borderRadius: Radius.pill, backgroundColor: Colors.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
  left: { marginTop: 8, fontFamily: Fonts.medium, fontSize: 13, color: Colors.muted },
  tiles: { marginTop: 12, flexDirection: 'row', gap: 12 },
  tile: { flex: 1, paddingVertical: 14 },
  tileLabel: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.muted },
  tileValue: { marginTop: 8, fontFamily: Fonts.bold, fontSize: 24, letterSpacing: -0.5, color: Colors.ink },
  tileOf: { fontFamily: Fonts.medium, fontSize: 15, color: Colors.muted },
  tileSub: { marginTop: 6, fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted },
  dots: { marginTop: 10, flexDirection: 'row', gap: 4 },
  dot: { flex: 1, height: 6, borderRadius: Radius.pill },
  list: { marginTop: 12, paddingVertical: 0 },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowTall: { minHeight: 64 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { flex: 1, fontFamily: Fonts.semibold, fontSize: 16, color: Colors.ink },
  rowSub: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted },
  divider: { borderTopWidth: 1, borderTopColor: Colors.divider },
  dim: { opacity: 0.4 },
  segments: { width: 150, height: 36, padding: 3, flexDirection: 'row', borderRadius: Radius.pill, backgroundColor: Colors.fill },
  segment: { flex: 1, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: Colors.white, shadowColor: Colors.ink, shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  segmentText: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.tabInactive },
  segmentTextOn: { color: Colors.ink },
  chartCard: { marginTop: 12 },
  chartTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chart: { marginTop: 14, height: 72, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  bar: { flex: 1, borderRadius: 6 },
  goalLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.faint },
  days: { marginTop: 6, flexDirection: 'row', gap: 10 },
  day: { flex: 1, textAlign: 'center', fontFamily: Fonts.medium, fontSize: 12, color: '#8A8A85' },
  dayToday: { fontFamily: Fonts.bold, color: Colors.ink },
  note: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  noteText: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: Colors.muted, textAlign: 'center' },
});
