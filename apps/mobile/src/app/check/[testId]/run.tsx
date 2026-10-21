import { TestId, type Eye } from '@visus/shared';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { useLeaveCheck } from '@/components/ExitDialog';
import { Screen } from '@/components/Screen';
import { TestHeader } from '@/components/TestHeader';
import { Text } from '@/components/Text';
import { testInfo } from '@/constants/tests';
import { Colors, Fonts } from '@/constants/theme';
import { submitResult } from '@/services/sessions';
import { useCheck } from '@/store/check';
import { TESTS, WHITE_PAGE } from '@/tests';
import { TestCard, type Answers } from '@/tests/parts';
import { SwitchEye } from '@/tests/SwitchEye';

type Phase = 'test' | 'switch' | 'sending' | 'error';

/** Where the server's reply leads: Between-test (14), Red-flag (15) or Analysing (16) for a full check. */
const NEXT_SCREEN = { next_test: '/check/next', red_flag: '/check/red-flag', done: '/check/analysing' } as const;

const secondsSince = (start: number) => Math.round((Date.now() - start) / 1000);

/**
 * Runs the current test: right eye, Switch eye (44), left eye for one-eye-at-a-time
 * tests, then sends the raw answers in one result. The server's reply picks what's next.
 */
export default function Run() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  const parsed = TestId.safeParse(testId);
  const id = parsed.success ? parsed.data : 'tumbling_e';
  const test = testInfo(id)!;
  const Test = TESTS[id];
  const sessionId = useCheck((s) => s.sessionId);
  const exit = useLeaveCheck();

  const eyes: Eye[] = test.eachEye ? ['right', 'left'] : ['both'];
  const [eyeIndex, setEyeIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('test');
  const answers = useRef<Partial<Record<Eye, Answers>>>({});
  const startedAt = useRef(0);
  const eye = eyes[eyeIndex];

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function send() {
    if (!sessionId) return;
    setPhase('sending');
    const a = answers.current;
    try {
      const step = await submitResult(sessionId, {
        testId: id,
        eye: 'both',
        answers: test.eachEye ? { right: a.right, left: a.left } : (a.both ?? {}),
        durationSec: secondsSince(startedAt.current),
      });
      const { record, mode } = useCheck.getState();
      record(step);
      // A test started on its own (Test detail) ends on Single test complete (48).
      if (step.type === 'done' && mode === 'single') router.replace({ pathname: '/tests/[testId]/done', params: { testId: id } });
      else router.replace(NEXT_SCREEN[step.type]);
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

  if (!sessionId) return <Redirect href="/home" />;

  return (
    <Screen background={WHITE_PAGE.includes(id) ? Colors.white : undefined}>
      <View style={styles.root}>
        {phase === 'test' && <Test key={eye} eye={eye} onExit={exit.ask} onDone={done} />}

        {phase === 'switch' && <SwitchEye title={test.name} onExit={exit.ask} onStart={() => setPhase('test')} />}

        {(phase === 'sending' || phase === 'error') && (
          <>
            <TestHeader title={test.name} onExit={exit.ask} />
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
        {exit.dialog}
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
