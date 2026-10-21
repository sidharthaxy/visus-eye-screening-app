import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, BackHandler, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Colors, Fonts } from '@/constants/theme';
import { getVerdict } from '@/services/sessions';
import { useCheck } from '@/store/check';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RING = 2 * Math.PI * 70; // 439.8
const STEPS = ['Checking clarity', 'Checking focus', 'Checking eye health', 'Comparing with past checks'];
const TICK_MS = 900;

/** Screen 16: Analysing. Asks the server for the verdict while the steps tick by. */
export default function Analysing() {
  const sessionId = useCheck((s) => s.sessionId);
  const verdict = useCheck((s) => s.verdict);
  const [tick, setTick] = useState(0);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [progress] = useState(() => new Animated.Value(0));

  // The last step waits for the verdict, so "ready" is never shown early.
  const shown = verdict ? tick : Math.min(tick, STEPS.length - 1);
  const ready = shown >= STEPS.length;
  const pct = Math.min(100, shown * 25);

  useEffect(() => {
    if (!sessionId) return;
    let live = true;
    getVerdict(sessionId)
      .then((v) => live && useCheck.getState().setVerdict(v))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [sessionId, attempt]);

  useEffect(() => {
    if (tick >= STEPS.length) return;
    const t = setTimeout(() => setTick(tick + 1), TICK_MS);
    return () => clearTimeout(t);
  }, [tick]);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: pct / 100,
      duration: TICK_MS,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [pct, progress]);

  // Results (17) open on their own once ready.
  useEffect(() => {
    if (!ready || !sessionId) return;
    const t = setTimeout(() => router.replace({ pathname: '/results/[sessionId]', params: { sessionId } }), 900);
    return () => clearTimeout(t);
  }, [ready, sessionId]);

  // No going back mid-analysis.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  if (!sessionId) return <Redirect href="/home" />;

  const offset = progress.interpolate({ inputRange: [0, 1], outputRange: [RING, 0] });

  return (
    <Screen>
      <View style={styles.root}>
        <View style={styles.centre}>
          <View style={styles.ringBox}>
            <Svg width={168} height={168} viewBox="0 0 168 168" style={styles.ring}>
              <Circle cx={84} cy={84} r={70} fill="none" stroke={Colors.border} strokeWidth={8} />
              <AnimatedCircle
                cx={84}
                cy={84}
                r={70}
                fill="none"
                stroke={Colors.acc}
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={RING}
                strokeDashoffset={offset}
              />
            </Svg>
            <Text style={styles.pct}>{pct}%</Text>
          </View>

          <Text style={styles.title}>
            {failed ? "Couldn't prepare your results" : ready ? 'Your results are ready' : 'Preparing your results…'}
          </Text>
          <Text style={styles.body}>
            {failed ? 'Check your internet connection and try again.' : 'Comparing both eyes with your past checks.'}
          </Text>

          {failed ? (
            <Button
              title="Try again"
              onPress={() => {
                setFailed(false);
                setAttempt(attempt + 1);
              }}
              style={styles.retry}
            />
          ) : (
            <View style={styles.steps}>
              {STEPS.map((label, i) => {
                const done = i < shown;
                const active = i === shown;
                return (
                  <View key={label} style={styles.step}>
                    <View style={[styles.mark, done && styles.markDone, active && styles.markActive]}>
                      {done && <Icon name="check" size={12} color={Colors.white} strokeWidth={2.4} />}
                      {active && <View style={styles.activeDot} />}
                    </View>
                    <Text style={[styles.stepText, (done || active) && styles.stepTextOn, active && styles.stepTextActive]}>
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Icon name="lock" size={16} color={Colors.muted} />
          <Text style={styles.footerText}>Your results are saved securely to your account.</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 4 },
  centre: { flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center' },
  ringBox: { width: 168, height: 168, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', transform: [{ rotate: '-90deg' }] },
  pct: { fontFamily: Fonts.bold, fontSize: 36, letterSpacing: -1, color: Colors.ink, fontVariant: ['tabular-nums'] },
  title: {
    marginTop: 32,
    fontFamily: Fonts.bold,
    fontSize: 26,
    lineHeight: 31,
    letterSpacing: -0.65,
    textAlign: 'center',
    color: Colors.ink,
  },
  body: { marginTop: 8, maxWidth: 290, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, textAlign: 'center', color: Colors.muted },
  retry: { marginTop: 24, alignSelf: 'stretch' },
  steps: { marginTop: 32, width: '100%', maxWidth: 280, gap: 16 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D6D6D1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markDone: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  markActive: { borderColor: Colors.ink },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.acc },
  stepText: { fontFamily: Fonts.medium, fontSize: 16, color: Colors.faint },
  stepTextOn: { color: Colors.ink },
  stepTextActive: { fontFamily: Fonts.bold },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  footerText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted },
});
