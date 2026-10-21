// Screen 34: Kids Tumbling E. Same chart as Distance acuity (6 lines), with a
// helper, a star for every answer (never right/wrong feedback) and big buttons.
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Icon } from '@/components/Icon';
import { TestHeader } from '@/components/TestHeader';
import { Text } from '@/components/Text';
import { Colors, Fonts } from '@/constants/theme';
import { LetterE, ROTATION, useEChart, type Dir } from '@/tests/eChart';
import { Mascot, ParentNote, STAR } from '@/tests/kids';
import { EYE_LABEL, TestCard, type TestProps } from '@/tests/parts';

const STAR_PATH = 'M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z';

/** Arrow buttons in a cross: [direction, column, row]. */
const PAD: [Dir, number, number][] = [
  ['up', 1, 0],
  ['left', 0, 1],
  ['right', 2, 1],
  ['down', 1, 2],
];

export function KidsTumblingE({ eye, onExit, onDone }: TestProps) {
  const { lines, line, current, pos, perLine, shown, blank, count, answer } = useEChart(6, onDone);
  const [pop, setPop] = useState<'star' | 'line' | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function press(dir: Dir) {
    const result = answer(dir);
    if (result === null || result === 'done') return;
    // A new line means the child earned it: say so instead of "a star".
    setPop(result === 'line' ? 'line' : 'star');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPop(null), 900);
  }

  const bubble =
    pop === 'line' ? 'Wow, great job! Next line!' : pop === 'star' ? 'Yay! You got a star!' : "Which way are the E's legs pointing?";

  return (
    <View style={styles.root}>
      <TestHeader
        title="Kids · Tumbling E"
        onExit={onExit}
        eyeLabel={EYE_LABEL[eye]}
        progress={`Line ${line + 1} of ${lines.length}`}
      />
      <Mascot text={bubble} pop={pop !== null} />

      <TestCard style={styles.card}>{!blank && <LetterE unit={current.unit} dir={shown} />}</TestCard>

      <View style={styles.slots}>
        {Array.from({ length: perLine }, (_, j) => (
          <View key={j} style={pop && j === pos - 1 ? styles.bump : undefined}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path d={STAR_PATH} fill={j < pos ? STAR : Colors.borderOption} />
            </Svg>
          </View>
        ))}
      </View>

      <View style={styles.pad}>
        {PAD.map(([dir, col, row]) => (
          <Pressable
            key={dir}
            accessibilityRole="button"
            accessibilityLabel={dir[0].toUpperCase() + dir.slice(1)}
            onPress={() => press(dir)}
            style={({ pressed }) => [styles.key, { left: `${(col * 100) / 3}%`, top: row * 86 }, pressed && styles.keyPressed]}>
            <View style={{ transform: [{ rotate: `${ROTATION[dir]}deg` }] }}>
              <Icon name="arrow" size={40} strokeWidth={2.6} />
            </View>
          </Pressable>
        ))}
        <View style={[styles.stars, { top: 86 }]}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path d={STAR_PATH} fill={STAR} />
          </Svg>
          <Text style={styles.starCount}>{count}</Text>
        </View>
      </View>

      <ParentNote />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { marginTop: 12 },
  slots: { marginTop: 12, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  bump: { transform: [{ scale: 1.3 }] },
  // 3 rows of 76 with 10 gaps; each key is a third of the width minus the gap.
  pad: { marginTop: 14, height: 76 * 3 + 20 },
  key: {
    position: 'absolute',
    width: '31.5%',
    marginLeft: '0.5%',
    height: 76,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: { backgroundColor: Colors.fill, transform: [{ scale: 0.94 }] },
  stars: {
    position: 'absolute',
    left: '33.33%',
    width: '33.33%',
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  starCount: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.ink },
});
