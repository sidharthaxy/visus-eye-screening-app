// Screen 26: Distance acuity (Tumbling E). One E at a time, smaller each line.
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Icon } from '@/components/Icon';
import { TestHeader } from '@/components/TestHeader';
import { Text } from '@/components/Text';
import { Colors, Fonts } from '@/constants/theme';
import { LetterE, PER_LINE, ROTATION, useEChart, type Dir } from '@/tests/eChart';
import { EYE_LABEL, TestCard, type TestProps } from '@/tests/parts';

/** Answer buttons, in the design's order. */
const BUTTONS: Dir[] = ['left', 'up', 'down', 'right'];

export function TumblingE({ eye, onExit, onDone }: TestProps) {
  const { lines, line, current, pos, shown, blank, answer } = useEChart(8, onDone);

  const swipe = Gesture.Pan()
    .runOnJS(true)
    .onEnd((e) => {
      const { translationX: x, translationY: y } = e;
      if (Math.max(Math.abs(x), Math.abs(y)) < 30) return;
      if (Math.abs(x) > Math.abs(y)) answer(x > 0 ? 'right' : 'left');
      else answer(y > 0 ? 'down' : 'up');
    });

  return (
    <View style={styles.root}>
      <TestHeader
        title="Distance acuity"
        onExit={onExit}
        eyeLabel={EYE_LABEL[eye]}
        progress={`Line ${line + 1} of ${lines.length} · ${current.snellen}`}
      />

      <GestureDetector gesture={swipe}>
        {/* Not flattened, so the swipe gesture keeps its native view. */}
        <View collapsable={false} style={styles.swipe}>
          <TestCard>{!blank && <LetterE unit={current.unit} dir={shown} />}</TestCard>
        </View>
      </GestureDetector>

      <View style={styles.dots}>
        {Array.from({ length: PER_LINE }, (_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i < pos ? Colors.ink : i === pos ? Colors.acc : Colors.borderOption }]}
          />
        ))}
      </View>

      <Text style={styles.question}>Which way is the E pointing?</Text>
      <View style={styles.buttons}>
        {BUTTONS.map((dir) => (
          <Pressable
            key={dir}
            accessibilityRole="button"
            accessibilityLabel={dir[0].toUpperCase() + dir.slice(1)}
            onPress={() => answer(dir)}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
            <View style={{ transform: [{ rotate: `${ROTATION[dir]}deg` }] }}>
              <Icon name="arrow" size={30} strokeWidth={2.4} />
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.note}>
        <Icon name="armsLength" size={16} color={Colors.muted} />
        <Text style={styles.noteText}>Hold the phone at arm&apos;s length, about 40 cm</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  swipe: { flex: 1, minHeight: 0 },
  dots: { marginTop: 14, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  question: { marginTop: 14, textAlign: 'center', fontFamily: Fonts.semibold, fontSize: 16, color: Colors.ink },
  buttons: { marginTop: 12, flexDirection: 'row', gap: 10 },
  button: {
    flex: 1,
    height: 76,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { backgroundColor: Colors.fill, transform: [{ scale: 0.94 }] },
  note: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  noteText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted },
});
