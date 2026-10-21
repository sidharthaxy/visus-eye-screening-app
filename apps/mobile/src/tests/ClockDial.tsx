// Screen 29: Astigmatism clock dial. Tap the lines that look darker; the
// server reads the marked axes.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

import { TestHeader } from '@/components/TestHeader';
import { Colors, Fonts } from '@/constants/theme';
import { COVER, EYE_LABEL, TestCard, TestFooter, TestQuestion, type TestProps } from '@/tests/parts';

/** Line pairs from 12 o'clock clockwise, 30° apart. */
const AXES = ['12-6', '1-7', '2-8', '3-9', '4-10', '5-11'];
const LINES = 'M145 38V116M150 38V116M155 38V116M145 184V262M150 184V262M155 184V262';
const NUMBERS: [string, number, number][] = [
  ['12', 150, 21], ['1', 217, 39], ['2', 266, 88], ['3', 284, 155], ['4', 266, 222], ['5', 217, 271],
  ['6', 150, 289], ['7', 83, 271], ['8', 34, 222], ['9', 16, 155], ['10', 34, 88], ['11', 83, 39],
];

export function ClockDial({ eye, onExit, onDone }: TestProps) {
  const [marked, setMarked] = useState<boolean[]>(() => AXES.map(() => false));
  const [same, setSame] = useState(false);
  const [box, setBox] = useState(0);
  const size = Math.max(0, box - 24);

  const toggle = (k: number) => {
    setMarked((m) => m.map((v, i) => (i === k ? !v : v)));
    setSame(false);
  };

  // Tap → the nearest line pair by angle, in the 300×300 dial space.
  const tap = Gesture.Tap()
    .runOnJS(true)
    .onEnd((e) => {
      if (!size) return;
      const x = (e.x / size) * 300 - 150;
      const y = (e.y / size) * 300 - 150;
      const r = Math.hypot(x, y);
      if (r < 22 || r > 130) return;
      const angle = ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 180;
      toggle(Math.round(angle / 30) % 6);
    });

  const darker = AXES.filter((_, i) => marked[i]);
  const summary = same
    ? 'All lines look the same'
    : darker.length
      ? `Darker: ${darker.map((a) => a.replace('-', '–')).join(', ')}`
      : 'No lines tapped yet';

  return (
    <View style={styles.root}>
      <TestHeader title="Astigmatism dial" onExit={onExit} eyeLabel={EYE_LABEL[eye]} progress={COVER[eye]} />
      <TestQuestion title="Do any lines look darker?" subtitle="Tap the lines that look darker or sharper than the rest." />

      <TestCard style={styles.card}>
        <View style={styles.fill} onLayout={(e) => setBox(Math.min(e.nativeEvent.layout.width, e.nativeEvent.layout.height))}>
          {size > 0 && (
            <GestureDetector gesture={tap}>
              <View collapsable={false} style={{ width: size, height: size }}>
                <Svg width={size} height={size} viewBox="0 0 300 300">
                  {AXES.map((axis, k) => (
                    <G key={axis} rotation={k * 30} origin="150, 150">
                      <Path
                        d={LINES}
                        fill="none"
                        stroke={marked[k] ? Colors.acc : Colors.ink}
                        strokeWidth={marked[k] ? 3.4 : 2}
                      />
                    </G>
                  ))}
                  <Circle cx={150} cy={150} r={3} fill={Colors.ink} />
                  {NUMBERS.map(([label, x, y]) => (
                    <SvgText
                      key={label}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      fontSize={15}
                      fontFamily={Fonts.semibold}
                      fill={Colors.muted}>
                      {label}
                    </SvgText>
                  ))}
                </Svg>
              </View>
            </GestureDetector>
          )}
        </View>
      </TestCard>

      <TestFooter
        summary={summary}
        toggleLabel="All look the same"
        toggled={same}
        onToggle={() => {
          setSame(!same);
          setMarked(AXES.map(() => false));
        }}
        doneLabel="Next"
        canFinish={same || darker.length > 0}
        onDone={() => onDone({ darker, allSame: same })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { marginTop: 16 },
  fill: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
});
