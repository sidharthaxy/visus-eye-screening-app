import type { EyeResult } from '@visus/shared';
import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { Colors, Fonts, StatusColors } from '@/constants/theme';
import { useCheck } from '@/store/check';

/** Ends the glasses check and goes Home. */
function finish() {
  router.dismissTo('/home');
  useCheck.getState().reset();
}

function Bar({ label, eye, strong }: { label: string; eye?: EyeResult; strong?: boolean }) {
  const color = !strong ? '#BDBDB8' : eye && eye.score >= 80 ? Colors.acc : StatusColors.mild.dot;
  return (
    <View style={styles.bar}>
      <Text style={[styles.barLabel, strong && styles.barLabelStrong]}>{label}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${eye?.score ?? 0}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.barValue, strong && styles.barValueStrong]}>{eye?.value ?? '–'}</Text>
    </View>
  );
}

/** Screen 61: Glasses check result. Round 1 (without) against round 2 (with glasses), per eye. */
export default function GlassesResult() {
  const verdict = useCheck((s) => s.verdict);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      finish();
      return true;
    });
    return () => sub.remove();
  }, []);

  if (!verdict) return <Redirect href="/home" />;

  const [without, withGlasses] = verdict.results;
  const sides = (['left', 'right'] as const).filter((s) => without?.eyes?.[s] || withGlasses?.eyes?.[s]);
  const fine = sides.every((s) => withGlasses?.eyes?.[s]?.status === 'good');
  const tone = fine ? StatusColors.good : StatusColors.mild;

  return (
    <Screen scroll>
      <View style={styles.root}>
        <ScreenHeader left="back" onLeft={finish} title="Glasses check" />

        <View style={[styles.badge, { backgroundColor: tone.bg }]}>
          <Icon name={fine ? 'checkLarge' : 'alertMark'} size={24} color={tone.fg} strokeWidth={fine ? 2.4 : 2.6} />
        </View>
        <Text style={styles.title}>{verdict.headline}</Text>
        <Text style={styles.sub}>{verdict.advice}</Text>

        <Text style={styles.h3}>Without vs with glasses</Text>
        <View style={styles.card}>
          {sides.map((side, i) => (
            <View key={side} style={[styles.eye, i > 0 && styles.divider]}>
              <Text style={styles.eyeName}>{side === 'left' ? 'Left eye' : 'Right eye'}</Text>
              <Bar label="Without" eye={without?.eyes?.[side]} />
              <Bar label="With" eye={withGlasses?.eyes?.[side]} strong />
            </View>
          ))}
        </View>
        <Text style={styles.note}>20/20 is typical sharp vision.</Text>

        <View style={styles.spacer} />
        <Button
          title="See lens suggestions"
          onPress={() => router.push({ pathname: '/results/[sessionId]/lens', params: { sessionId: verdict.sessionId } })}
        />
        <Button title="Done" variant="ghost" onPress={finish} style={styles.done} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  badge: { marginTop: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 16, fontFamily: Fonts.bold, fontSize: 28, lineHeight: 32, letterSpacing: -0.7, color: Colors.ink },
  sub: { marginTop: 8, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: Colors.muted },
  h3: { marginTop: 22, fontFamily: Fonts.bold, fontSize: 17, color: Colors.ink },
  card: { marginTop: 10, paddingVertical: 2, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  eye: { paddingVertical: 14, gap: 10 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.divider },
  eyeName: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.ink },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { width: 64, fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted },
  barLabelStrong: { fontFamily: Fonts.semibold, color: Colors.ink },
  track: { flex: 1, height: 8, borderRadius: 99, backgroundColor: Colors.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 99 },
  barValue: { width: 48, textAlign: 'right', fontFamily: Fonts.semibold, fontSize: 14, color: Colors.muted },
  barValueStrong: { fontFamily: Fonts.bold, color: Colors.ink },
  note: { marginTop: 10, marginHorizontal: 4, fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted },
  spacer: { flex: 1, minHeight: 16 },
  done: { marginTop: 4, height: 44 },
});
