import type { NextStep } from '@visus/shared';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Linking, Share, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { useLeaveCheck } from '@/components/ExitDialog';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { testInfo } from '@/constants/tests';
import { Colors, Fonts, Radius, StatusColors } from '@/constants/theme';
import { firstStep, useCheck } from '@/store/check';
import { EYE_LABEL } from '@/tests/parts';

/** Opens the maps app on a search for eye doctors near the user. */
const DOCTORS_URL = 'https://www.google.com/maps/search/?api=1&query=eye+doctor+near+me';

type RedFlag = Extract<NextStep, { type: 'red_flag' }>;

/** Screen 15: Red-flag alert. Shown when the server's rules flag a result. */
export default function RedFlagAlert() {
  const step = useCheck((s) => s.step);
  const done = useCheck((s) => s.results.length);
  const total = useCheck((s) => s.plan.length);
  const exit = useLeaveCheck();
  const [saved, setSaved] = useState(false);

  if (step?.type !== 'red_flag') return <Redirect href="/home" />;

  const test = testInfo(step.result.testId)!;

  async function saveReport(flag: RedFlag) {
    const eye = flag.result.eye === 'both' ? '' : ` (${EYE_LABEL[flag.result.eye].toLowerCase()})`;
    const result = await Share.share({
      title: 'Visus eye check',
      message: [
        `Visus eye check, ${new Date().toLocaleDateString()}`,
        `${test.name}: ${flag.finding}${eye}.`,
        flag.result.summary,
        'Advice: visit an eye doctor soon, ideally within the next week.',
        'This is a screening, not a diagnosis.',
      ].join('\n'),
    });
    if (result.action === Share.sharedAction) setSaved(true);
  }

  function continueCheck() {
    const { advance, mode } = useCheck.getState();
    if (advance()) router.replace(firstStep());
    else if (mode === 'single') router.replace({ pathname: '/tests/[testId]/done', params: { testId: test.id } });
    else router.replace('/check/analysing');
  }

  return (
    <Screen>
      <View style={styles.root}>
        <ScreenHeader left="close" leftLabel="Exit check" onLeft={exit.ask} title={test.name} right={`${done} of ${total}`} />

        <View style={styles.icon}>
          <Icon name="warning" size={30} color={StatusColors.see_doctor.fg} />
        </View>
        <Text style={styles.title}>Visit an eye doctor soon</Text>
        <Text style={styles.body}>Something in this test is worth a professional look, ideally within the next week.</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>What we noticed</Text>
          <View style={styles.row}>
            <View style={styles.dot} />
            <Text style={styles.finding}>{step.finding}</Text>
            {step.result.eye !== 'both' && <Text style={styles.eye}>{EYE_LABEL[step.result.eye]}</Text>}
          </View>
        </View>

        <Text style={styles.disclaimer}>
          This isn&apos;t a diagnosis. If your vision suddenly gets worse, go to a doctor today.
        </Text>

        <View style={styles.spacer} />
        <View style={styles.actions}>
          <Button title="Find eye doctors nearby" icon="pin" onPress={() => void Linking.openURL(DOCTORS_URL)} />
          <Button
            title={saved ? 'Report saved' : 'Save report'}
            variant="secondary"
            icon={saved ? 'checkLarge' : 'download'}
            iconColor={saved ? StatusColors.good.fg : undefined}
            onPress={() => void saveReport(step)}
            style={saved && styles.saved}
          />
          <Button title="Continue check" variant="ghost" onPress={continueCheck} />
        </View>
        {exit.dialog}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  icon: {
    marginTop: 28,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: StatusColors.see_doctor.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 20, fontFamily: Fonts.bold, fontSize: 28, lineHeight: 32, letterSpacing: -0.7, color: Colors.ink },
  body: { marginTop: 8, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: Colors.muted },
  card: {
    marginTop: 20,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  cardLabel: { paddingTop: 12, paddingBottom: 2, fontFamily: Fonts.bold, fontSize: 13, color: Colors.muted },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: StatusColors.see_doctor.dot },
  finding: { flex: 1, fontFamily: Fonts.semibold, fontSize: 16, color: Colors.ink },
  eye: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted },
  disclaimer: { marginTop: 14, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, color: Colors.muted },
  spacer: { flex: 1, minHeight: 16 },
  actions: { gap: 10 },
  saved: { borderColor: '#9FD1B2' },
});
