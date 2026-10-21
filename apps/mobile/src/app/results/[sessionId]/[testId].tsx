import { TestId, type SessionSummary } from '@visus/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { alertError } from '@/components/alertError';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/Chip';
import { Text } from '@/components/Text';
import { EyeBars, FieldMap, LoadState, NoteCard, TipCard } from '@/components/results';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { dayLabel } from '@/constants/report';
import { CATEGORIES, testInfo } from '@/constants/tests';
import { Colors, Fonts } from '@/constants/theme';
import { listSessions } from '@/services/sessions';
import { startSingleTest, useVerdict } from '@/store/check';

/** The most recent earlier check that has a score for this test: "86 on 12 Oct". */
function previousOf(sessions: SessionSummary[], sessionId: string, testId: TestId, before?: string) {
  const prev = sessions.find((s) => s.id !== sessionId && (!before || s.date < before) && s.scores[testId] !== undefined);
  return prev ? `${prev.scores[testId]} on ${dayLabel(prev.date)}` : null;
}

/** Screen 18: Test result detail. For peripheral vision it shows the field map (58). */
export default function TestResultDetail() {
  const params = useLocalSearchParams<{ sessionId: string; testId: string }>();
  const parsed = TestId.safeParse(params.testId);
  const testId = parsed.success ? parsed.data : 'tumbling_e';
  const { verdict, failed, retry } = useVerdict(params.sessionId);
  const [previous, setPrevious] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const test = testInfo(testId)!;
  const category = CATEGORIES.find((c) => c.id === test.category)!;

  useEffect(() => {
    if (!verdict) return;
    let live = true;
    listSessions()
      .then((s) => live && setPrevious(previousOf(s, params.sessionId, testId, verdict.date)))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [verdict, params.sessionId, testId]);

  const result = verdict?.results.filter((r) => r.testId === testId).pop();

  async function retake() {
    setStarting(true);
    try {
      router.push(await startSingleTest(testId));
    } catch (e) {
      alertError(e, "Couldn't start the test");
    } finally {
      setStarting(false);
    }
  }

  if (!result) {
    return (
      <Screen>
        <ScreenHeader left="back" onLeft={() => router.back()} title={category.tile} small />
        {verdict ? (
          <Text style={styles.meaning}>This test wasn&apos;t part of this check.</Text>
        ) : (
          <LoadState failed={failed} onRetry={retry} />
        )}
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.root}>
        <ScreenHeader left="back" onLeft={() => router.back()} title={category.tile} small />

        <Text style={styles.title}>{test.name}</Text>
        <View style={styles.scoreRow}>
          <View style={styles.score}>
            <Text style={styles.scoreValue}>{result.score}</Text>
            <Text style={styles.outOf}>/ 100</Text>
          </View>
          <View style={styles.scoreSide}>
            <StatusBadge status={result.status} />
            {previous && <Text style={styles.previous}>{previous}</Text>}
          </View>
        </View>

        {result.field ? (
          <>
            <Text style={styles.h3}>Your field map</Text>
            <Text style={styles.sub}>What each eye noticed around the centre dot.</Text>
            <FieldMap field={result.field} />
            <Text style={[styles.meaning, styles.meaningAfterMap]}>{result.meaning ?? result.summary}</Text>
            <NoteCard text="Rough screen only; see a doctor for a full field test." />
          </>
        ) : (
          <>
            <Text style={styles.h3}>What it means</Text>
            <Text style={styles.meaning}>{result.meaning ?? result.summary}</Text>
            {result.eyes && (
              <>
                <Text style={styles.h3}>Left vs right</Text>
                <EyeBars eyes={result.eyes} />
              </>
            )}
          </>
        )}
        {result.tip && <TipCard tip={result.tip} />}

        <View style={styles.spacer} />
        <View style={styles.actions}>
          <Button title="Retake test" variant="secondary" onPress={() => void retake()} disabled={starting} style={styles.action} />
          <Button title="Done" onPress={() => router.back()} style={styles.action} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: { marginTop: 16, fontFamily: Fonts.bold, fontSize: 28, lineHeight: 32, letterSpacing: -0.7, color: Colors.ink },
  scoreRow: { marginTop: 14, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  score: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  scoreValue: { fontFamily: Fonts.bold, fontSize: 52, lineHeight: 56, letterSpacing: -2, color: Colors.ink },
  outOf: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.muted },
  scoreSide: { alignItems: 'flex-end', gap: 6, paddingBottom: 6 },
  previous: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted },
  h3: { marginTop: 22, fontFamily: Fonts.bold, fontSize: 17, color: Colors.ink },
  sub: { marginTop: 4, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: Colors.muted },
  meaning: { marginTop: 6, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: Colors.inkSoft },
  meaningAfterMap: { marginTop: 18 },
  spacer: { flex: 1, minHeight: 16 },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1, paddingHorizontal: 8 },
});
