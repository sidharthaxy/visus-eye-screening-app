import type { SessionSummary, Verdict } from '@visus/shared';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { areasOf, elapsed, findingsOf, fullDate } from '@/constants/report';
import { Colors, Fonts, Radius, StatusColors } from '@/constants/theme';
import { getMyProfile } from '@/services/profiles';
import { getSession, listSessions } from '@/services/sessions';
import { newCheckRoute } from '@/store/check';
import { useSettings } from '@/store/settings';

const WEEK = 7 * 86_400_000;

/** Screen 56: Re-check reminder. From the Home banner when the last check is old. */
export default function Recheck() {
  const [last, setLast] = useState<SessionSummary | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [later, setLater] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    Promise.all([getMyProfile(), listSessions()])
      .then(async ([me, sessions]) => {
        const mine = sessions.find((s) => s.profileId === me.id) ?? null;
        if (!live) return;
        setLast(mine);
        if (mine) {
          const v = await getSession(mine.id);
          if (live) setVerdict(v);
        }
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  async function remindLater() {
    const date = new Date(Date.now() + WEEK);
    useSettings.getState().snoozeRecheck(date.toISOString());
    setLater(date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
    // Loaded on use: importing expo-notifications logs an Expo Go push warning.
    await (await import('@/services/reminders')).remindRecheckOn(date).catch(() => false);
  }

  const note = verdict ? (findingsOf(verdict)[0]?.meaning ?? findingsOf(verdict)[0]?.summary) : undefined;

  return (
    <Screen scroll>
      <View style={styles.root}>
        <ScreenHeader left="close" onLeft={() => router.back()} />

        <View style={styles.pill}>
          <Icon name="bell" size={16} color={Colors.accInk} strokeWidth={2} />
          <Text style={styles.pillText}>Check-up reminder</Text>
        </View>
        <Text style={styles.title}>
          {last ? `It's been ${elapsed(last.date)} since your last check` : 'Time for an eye check'}
        </Text>
        <Text style={styles.sub}>Eyes can change slowly. A 5-minute check keeps your record up to date.</Text>

        {last && (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>Last result</Text>
              <Text style={styles.date}>{fullDate(last.date)}</Text>
            </View>
            {!verdict ? (
              <ActivityIndicator color={Colors.ink} style={styles.loading} />
            ) : (
              <>
                <View style={styles.areas}>
                  {areasOf(verdict).map((a) => (
                    <View key={a.id} style={styles.area}>
                      <Text style={styles.areaName}>{a.tile}</Text>
                      <View style={styles.areaStatus}>
                        <View style={[styles.dot, { backgroundColor: StatusColors[a.status].dot }]} />
                        <Text style={[styles.areaLabel, { color: StatusColors[a.status].fg }]}>{StatusColors[a.status].label}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                {note && <Text style={styles.note}>{note}</Text>}
              </>
            )}
          </View>
        )}

        <View style={styles.spacer} />
        <Button title="Start check" arrow onPress={() => void newCheckRoute().then((href) => router.replace(href))} />
        <Button
          title={later ? `Okay, we'll remind you on ${later}` : 'Remind me in a week'}
          variant="ghost"
          disabled={!!later}
          onPress={() => void remindLater()}
          style={styles.later}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pill: {
    alignSelf: 'flex-start',
    marginTop: 20,
    minHeight: 32,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accSoft,
  },
  pillText: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.accInk },
  title: { marginTop: 14, fontFamily: Fonts.bold, fontSize: 30, lineHeight: 35, letterSpacing: -0.75, color: Colors.ink },
  sub: { marginTop: 10, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: Colors.muted },
  card: { marginTop: 20, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  cardTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  cardTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.ink },
  date: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted },
  loading: { marginTop: 16 },
  areas: { marginTop: 10 },
  area: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  areaName: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.ink },
  areaStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  areaLabel: { fontFamily: Fonts.semibold, fontSize: 15 },
  note: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.muted,
  },
  spacer: { flex: 1, minHeight: 16 },
  later: { marginTop: 4, height: 44 },
});
