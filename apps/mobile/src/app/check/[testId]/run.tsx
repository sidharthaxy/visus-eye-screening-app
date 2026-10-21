import { TestId, type Eye } from '@visus/shared';
import * as Speech from 'expo-speech';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TestHeader } from '@/components/TestHeader';
import { testInfo } from '@/constants/tests';
import { Colors, Fonts } from '@/constants/theme';
import { submitResult } from '@/services/sessions';
import { firstStep, useCheck } from '@/store/check';
import { TESTS } from '@/tests';
import { COVER, EYE_LABEL, TestCard, type Answers } from '@/tests/parts';

type Phase = 'test' | 'switch' | 'sending' | 'error';

function leave() {
  Speech.stop();
  useCheck.getState().reset();
  router.dismissTo('/home');
}

function confirmExit() {
  Alert.alert('Leave this check?', "You'll need to start again to get your results.", [
    { text: 'Keep going', style: 'cancel' },
    { text: 'Leave', style: 'destructive', onPress: leave },
  ]);
}

const SWITCH = {
  title: 'Now cover your right eye',
  body: "Keep the phone at the same distance. We'll check your left eye next.",
};

/**
 * Runs the current test: right eye then left eye for one-eye-at-a-time tests,
 * then sends the raw answers in one result. The server's reply picks what's next.
 */
export default function Run() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  const parsed = TestId.safeParse(testId);
  const id = parsed.success ? parsed.data : 'tumbling_e';
  const test = testInfo(id)!;
  const Test = TESTS[id];
  const sessionId = useCheck((s) => s.sessionId);

  const eyes: Eye[] = test.eachEye ? ['right', 'left'] : ['both'];
  const [eyeIndex, setEyeIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('test');
  const answers = useRef<Partial<Record<Eye, Answers>>>({});
  const startedAt = useRef(0);
  const eye = eyes[eyeIndex];

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Android back button asks first instead of dropping the test.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmExit();
      return true;
    });
    return () => sub.remove();
  }, []);

  // Read the eye switch aloud: the phone is at arm's length.
  useEffect(() => {
    if (phase !== 'switch') return;
    Speech.speak(`${SWITCH.title}. ${SWITCH.body}`, { language: 'en', rate: 0.95 });
    return () => {
      Speech.stop();
    };
  }, [phase]);

  async function send() {
    if (!sessionId) return;
    setPhase('sending');
    const a = answers.current;
    try {
      const step = await submitResult(sessionId, {
        testId: id,
        eye: 'both',
        answers: test.eachEye ? { right: a.right, left: a.left } : (a.both ?? {}),
        durationSec: Math.round((Date.now() - startedAt.current) / 1000),
      });
      const check = useCheck.getState();
      check.record(step);
      // Until the between-test, red-flag and analysing screens exist (group 5):
      // next test → its instructions; red flag → the next test in the plan; done → Home.
      if (step.type === 'next_test') router.replace(firstStep());
      else if (step.type === 'red_flag' && check.advance()) router.replace(firstStep());
      else leave();
    } catch {
      setPhase('error');
    }
  }

  function done(result: Answers) {
    answers.current[eye] = result;
    if (eyeIndex < eyes.length - 1) {
      setEyeIndex(eyeIndex + 1);
      setPhase('switch');
    } else {
      void send();
    }
  }

  if (!sessionId || !Test) return <Redirect href="/home" />;

  return (
    <Screen>
      <View style={styles.root}>
        {phase === 'test' && <Test key={eye} eye={eye} onExit={confirmExit} onDone={done} />}

        {phase === 'switch' && (
          <>
            <TestHeader title={test.name} onExit={confirmExit} eyeLabel={EYE_LABEL[eye]} progress={COVER[eye]} />
            <TestCard style={styles.message}>
              <Text style={styles.title}>{SWITCH.title}</Text>
              <Text style={styles.body}>{SWITCH.body}</Text>
            </TestCard>
            <Button title="Start left eye" onPress={() => setPhase('test')} style={styles.button} />
          </>
        )}

        {(phase === 'sending' || phase === 'error') && (
          <>
            <TestHeader title={test.name} onExit={confirmExit} />
            <TestCard style={styles.message}>
              {phase === 'sending' ? (
                <>
                  <ActivityIndicator color={Colors.ink} />
                  <Text style={styles.body}>Checking your answers…</Text>
                </>
              ) : (
                <>
                  <Text style={styles.title}>Couldn&apos;t send your answers</Text>
                  <Text style={styles.body}>Check your internet connection and try again.</Text>
                </>
              )}
            </TestCard>
            {phase === 'error' && <Button title="Try again" onPress={() => void send()} style={styles.button} />}
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  message: { marginTop: 16, paddingHorizontal: 28, gap: 10 },
  title: { fontFamily: Fonts.bold, fontSize: 26, lineHeight: 31, letterSpacing: -0.65, textAlign: 'center', color: Colors.ink },
  body: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, textAlign: 'center', color: Colors.muted },
  button: { marginTop: 16 },
});
