import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { LoadState } from '@/components/results';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { dayDate, dayLetter, hm } from '@/constants/coach';
import { Colors, Fonts, Radius, StatusColors } from '@/constants/theme';
import { getBreakDays, getScreenTimeDays, goalMinutes, hasUsageAccess, openUsageAccessSettings, type DayBreaks, type DayMinutes } from '@/services/coach';
import { useSettings } from '@/store/settings';

const CHART = 110;
const average = (days: DayMinutes[]) => (days.length ? days.reduce((n, d) => n + d.minutes, 0) / days.length : 0);

/** Screen 23: Weekly report. The last 7 days of screen time and breaks, compared with the week before. */
export default function Weekly() {
  const childMode = useSettings((s) => s.coach.childMode);
  const [days, setDays] = useState<DayMinutes[] | null>(null);
  const [breaks, setBreaks] = useState<DayBreaks[]>([]);
  const [selected, setSelected] = useState(6);
  const [failed, setFailed] = useState(false);
  const [usage, setUsage] = useState(hasUsageAccess);

  const load = useCallback(() => {
    setFailed(false);
    setUsage(hasUsageAccess());
    Promise.all([getScreenTimeDays(14), getBreakDays(7)]).then(
      ([d, b]) => {
        setDays(d);
        setBreaks(b);
      },
      () => setFailed(true),
    );
  }, []);
  useFocusEffect(load);

  const header = <ScreenHeader left="back" onLeft={() => router.back()} title="Weekly report" />;
  if (!usage)
    return (
      <Screen scroll>
        {header}
        <View style={[styles.card, styles.first]}>
          <Text style={styles.cardTitle}>Turn on screen time first</Text>
          <Text style={styles.body}>Allow Usage access for Visus so the weekly report can count your screen time.</Text>
          <Button title="Turn on screen time" onPress={openUsageAccessSettings} style={styles.cardButton} />
        </View>
      </Screen>
    );
  if (!days)
    return (
      <Screen>
        {header}
        <LoadState failed={failed} onRetry={load} />
      </Screen>
    );

  const week = days.slice(-7);
  const before = days.slice(0, Math.max(0, days.length - 7));
  const goal = goalMinutes();
  const avg = average(week);
  const diff = Math.round(avg - average(before));
  const hasBefore = before.some((d) => d.minutes > 0);
  const max = Math.max(goal * 1.5, ...week.map((d) => d.minutes), 1);
  const taken = breaks.reduce((n, b) => n + b.taken, 0);
  const skipped = breaks.reduce((n, b) => n + b.skipped, 0);
  const total = taken + skipped;
  const day = week[selected] ?? week[week.length - 1];
  const range = `${dayDate(week[0].date).getDate()}–${dayDate(week[week.length - 1].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
  const overDays = week.filter((d) => d.minutes > goal).length;
  const tip =
    total > 0 && skipped / total > 0.3
      ? `You skipped ${skipped} of ${total} breaks. Looking 20 feet away for 20 seconds really does rest your eyes.`
      : overDays >= 3
        ? `You went over your ${childMode ? '2h limit' : '6h goal'} on ${overDays} days. An earlier screen-off time could help.`
        : 'Nice week. Keep taking a 20-second break every 20 minutes.';

  function share() {
    void Share.share({
      message: `Visus screen time ${range}: daily average ${hm(avg)}${hasBefore ? ` (${Math.abs(diff)} min ${diff <= 0 ? 'less' : 'more'} than last week)` : ''}. Breaks: ${taken} taken, ${skipped} skipped.`,
    });
  }

  return (
    <Screen scroll>
      {header}
      <View style={styles.meta}>
        <Text style={styles.range}>{range}</Text>
        {childMode && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>Child mode</Text>
          </View>
        )}
      </View>
      <Text style={styles.title}>Your week</Text>

      <View style={[styles.card, styles.first]}>
        <View style={styles.avgRow}>
          <View>
            <Text style={styles.label}>Daily average</Text>
            <Text style={styles.avg}>{hm(avg)}</Text>
          </View>
          {hasBefore && diff !== 0 && (
            <View style={[styles.change, { backgroundColor: diff < 0 ? StatusColors.good.bg : StatusColors.mild.bg }]}>
              <Text style={[styles.changeText, { color: diff < 0 ? StatusColors.good.fg : StatusColors.mild.fg }]}>
                {Math.abs(diff)} min {diff < 0 ? 'less' : 'more'} than last week
              </Text>
            </View>
          )}
        </View>
        <View style={styles.chart}>
          {week.map((d, i) => (
            <Pressable
              key={d.date}
              accessibilityLabel={`${dayDate(d.date).toLocaleDateString('en-GB', { weekday: 'long' })} ${hm(d.minutes)}`}
              onPress={() => setSelected(i)}
              style={[
                styles.bar,
                {
                  height: Math.max(4, (d.minutes / max) * CHART),
                  backgroundColor: i === selected ? Colors.ink : d.minutes > goal ? '#F1DDB7' : Colors.borderOption,
                },
              ]}
            />
          ))}
          <View pointerEvents="none" style={[styles.goalLine, { bottom: (goal / max) * CHART }]} />
          <Text style={[styles.goalLabel, { bottom: (goal / max) * CHART + 4 }]}>{childMode ? '2h limit' : '6h goal'}</Text>
        </View>
        <View style={styles.days}>
          {week.map((d, i) => (
            <Text key={d.date} style={[styles.day, i === selected && styles.daySelected]}>
              {dayLetter(d.date)}
            </Text>
          ))}
        </View>
        <View style={styles.dayRow}>
          <Text style={styles.dayName}>{dayDate(day.date).toLocaleDateString('en-GB', { weekday: 'long' })}</Text>
          <Text style={styles.dayValue}>
            {hm(day.minutes)}
            {day.minutes > goal ? ' · over limit' : ''}
          </Text>
        </View>
      </View>

      <View style={[styles.card, styles.breaks]}>
        <View style={styles.breaksTop}>
          <Text style={styles.cardTitle}>Breaks</Text>
          <Text style={styles.label}>{total} reminders</Text>
        </View>
        <View style={styles.split}>
          <View style={[styles.splitPart, { flex: Math.max(taken, total ? 0 : 1), backgroundColor: Colors.acc }]} />
          <View style={[styles.splitPart, { flex: Math.max(skipped, 0.001), backgroundColor: Colors.borderOption }]} />
        </View>
        <View style={styles.legend}>
          <Text style={styles.legendText}>
            <Text style={styles.legendBold}>{taken}</Text> taken
          </Text>
          <Text style={styles.legendText}>
            <Text style={styles.legendBold}>{skipped}</Text> skipped
          </Text>
        </View>
      </View>

      <View style={styles.tip}>
        <Icon name="bulb" size={20} color={Colors.accInk} strokeWidth={1.9} />
        <Text style={styles.tipText}>{tip}</Text>
      </View>

      <Button title="Share report" icon="share" onPress={share} style={styles.share} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  first: { marginTop: 16 },
  card: { padding: 16, borderRadius: Radius.card, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  cardTitle: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.ink },
  body: { marginTop: 6, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: Colors.muted },
  cardButton: { marginTop: 14 },
  meta: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 8 },
  range: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.muted },
  tag: { height: 24, paddingHorizontal: 10, borderRadius: Radius.pill, backgroundColor: Colors.pill, justifyContent: 'center' },
  tagText: { fontFamily: Fonts.semibold, fontSize: 12, color: Colors.inkSoft },
  title: { marginTop: 4, fontFamily: Fonts.bold, fontSize: 28, letterSpacing: -0.7, color: Colors.ink },
  avgRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  label: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.muted },
  avg: { marginTop: 2, fontFamily: Fonts.bold, fontSize: 28, letterSpacing: -0.5, color: Colors.ink },
  change: { height: 26, paddingHorizontal: 10, borderRadius: Radius.pill, justifyContent: 'center', flexShrink: 1 },
  changeText: { fontFamily: Fonts.semibold, fontSize: 12 },
  chart: { marginTop: 18, height: CHART, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  bar: { flex: 1, borderRadius: 7 },
  goalLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.faint },
  goalLabel: { position: 'absolute', right: 0, fontFamily: Fonts.semibold, fontSize: 11, color: '#8A8A85' },
  days: { marginTop: 6, flexDirection: 'row', gap: 10 },
  day: { flex: 1, textAlign: 'center', fontFamily: Fonts.medium, fontSize: 12, color: '#8A8A85' },
  daySelected: { fontFamily: Fonts.bold, color: Colors.ink },
  dayRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.divider, flexDirection: 'row', justifyContent: 'space-between' },
  dayName: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted },
  dayValue: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.ink },
  breaks: { marginTop: 12, gap: 10 },
  breaksTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  split: { height: 10, flexDirection: 'row', gap: 3, borderRadius: Radius.pill, overflow: 'hidden' },
  splitPart: { borderRadius: Radius.pill },
  legend: { flexDirection: 'row', gap: 18 },
  legendText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted },
  legendBold: { fontFamily: Fonts.bold, color: Colors.ink },
  tip: { marginTop: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: Radius.card, backgroundColor: Colors.accSoft, flexDirection: 'row', gap: 12 },
  tipText: { flex: 1, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: Colors.inkSoft },
  share: { marginTop: 16 },
});
