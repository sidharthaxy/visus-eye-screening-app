import { TestId } from '@visus/shared';
import * as Speech from 'expo-speech';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TestArt } from '@/components/TestArt';
import { Text } from '@/components/Text';
import { INSTRUCTIONS, testInfo } from '@/constants/tests';
import { Colors, Fonts, Radius, Sizes } from '@/constants/theme';
import { glassesRound, useCheck } from '@/store/check';

/** Screen 13: Test instructions, with the steps read aloud on "Listen". */
export default function Instructions() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  const parsed = TestId.safeParse(testId);
  const id = parsed.success ? parsed.data : 'tumbling_e';
  const test = testInfo(id)!;
  const plan = useCheck((s) => s.plan);
  const index = useCheck((s) => s.index);
  // The plan can repeat a test (glasses check), so prefer the current position.
  const position = plan[index]?.testId === id ? index : plan.findIndex((p) => p.testId === id);
  // Glasses check: round 1 without glasses, round 2 with them.
  const [round] = useState(glassesRound);
  const copy = round
    ? {
        ...INSTRUCTIONS[id],
        tip: round === 'glasses_off' ? 'Take your glasses off for this round.' : 'Put your glasses back on for this round.',
      }
    : INSTRUCTIONS[id];

  // -1 = not playing; 0 = title; 1..3 = steps; 4 = tip.
  const [part, setPart] = useState(-1);
  const playing = part >= 0;
  const run = useRef(0);

  const parts = [`${copy.title}. ${copy.subtitle}`, ...copy.steps, copy.tip];

  function speakFrom(i: number, token: number) {
    if (token !== run.current) return;
    if (i >= parts.length) return setPart(-1);
    setPart(i);
    Speech.speak(parts[i], {
      language: 'en',
      rate: 0.95,
      onDone: () => speakFrom(i + 1, token),
      onError: () => setPart(-1),
    });
  }

  function toggle() {
    run.current += 1;
    Speech.stop();
    if (playing) setPart(-1);
    else speakFrom(0, run.current);
  }

  // Stop talking when leaving the screen.
  useEffect(
    () => () => {
      run.current += 1;
      Speech.stop();
    },
    [],
  );

  const activeStep = part >= 1 && part <= 3 ? part - 1 : -1;

  return (
    <Screen scroll>
      <ScreenHeader
        left="back"
        onLeft={() => router.back()}
        title={test.name}
        right={position >= 0 && plan.length > 1 ? `${position + 1} of ${plan.length}` : undefined}
      />

      <TestArt testId={id} height={200} />

      <View>
        {round && (
          <View style={styles.round}>
            <Icon name={round === 'glasses_off' ? 'glassesOff' : 'glasses'} size={16} color={Colors.white} strokeWidth={1.9} />
            <Text style={styles.roundText}>{round === 'glasses_off' ? 'Round 1 · Glasses off' : 'Round 2 · Glasses on'}</Text>
          </View>
        )}
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
      </View>

      <View style={styles.steps}>
        {copy.steps.map((step, i) => {
          const active = i === activeStep;
          const dim = activeStep !== -1 && !active;
          return (
            <View key={i} style={styles.step}>
              <View style={[styles.num, active && styles.numActive]}>
                <Text style={[styles.numText, active && styles.numTextActive]}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, dim && styles.dim]}>{step}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.tip}>
        <Icon name={round === 'glasses_off' ? 'glassesOff' : 'glasses'} size={18} color={Colors.inkSoft} strokeWidth={1.9} />
        <Text style={styles.tipText}>{copy.tip}</Text>
      </View>

      <View style={styles.spacer} />
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Stop' : 'Listen'}
          onPress={toggle}
          style={[styles.listen, playing && styles.listenOn]}>
          <Icon name={playing ? 'stop' : 'speaker'} size={20} color={playing ? Colors.white : Colors.ink} />
          <Text style={[styles.listenText, playing && styles.listenTextOn]}>{playing ? 'Stop' : 'Listen'}</Text>
        </Pressable>
        <Button
          title="I'm ready"
          onPress={() => router.replace({ pathname: '/check/[testId]/run', params: { testId: id } })}
          style={styles.ready}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: Fonts.bold, fontSize: 28, lineHeight: 32, letterSpacing: -0.7, marginTop: 6, color: Colors.ink },
  subtitle: { fontFamily: Fonts.regular, fontSize: 16, marginTop: 4, color: Colors.muted },
  steps: { gap: 12, marginTop: 4 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  num: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.accSoft, alignItems: 'center', justifyContent: 'center' },
  numActive: { backgroundColor: Colors.ink },
  numText: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.accInk },
  numTextActive: { color: Colors.white },
  stepText: { flex: 1, paddingTop: 3, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 23, color: Colors.ink },
  dim: { color: Colors.faint },
  tip: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  round: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    minHeight: 30,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
  },
  roundText: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.white },
  tipText: { flex: 1, fontFamily: Fonts.regular, fontSize: 14, color: Colors.inkSoft },
  spacer: { flex: 1, minHeight: 0 },
  actions: { flexDirection: 'row', gap: 10 },
  listen: {
    minHeight: Sizes.button,
    paddingHorizontal: 18,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listenOn: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  listenText: { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.ink },
  listenTextOn: { color: Colors.white },
  ready: { flex: 1 },
});
