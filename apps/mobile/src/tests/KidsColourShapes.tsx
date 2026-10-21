// Screen 35: Kids colour shapes. 6 dot plates hiding a star, circle or square
// (or nothing); the child names the shape and a parent taps it.
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { TestHeader } from '@/components/TestHeader';
import { Text } from '@/components/Text';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { Mascot, ParentNote } from '@/tests/kids';
import { EYE_LABEL, type TestProps } from '@/tests/parts';
import { DEMO, PINK_GREEN, RED_GREEN, type Figure, type Palette } from '@/tests/plates';
import { PlateView } from '@/tests/PlateView';

type Shape = Extract<Figure, { kind: 'shape' }>['value'];

/** First plate is a demo every child should see. */
const PLATES: { figure: Figure; palette: Palette }[] = [
  { figure: { kind: 'shape', value: 'star' }, palette: DEMO },
  { figure: { kind: 'shape', value: 'circle' }, palette: PINK_GREEN },
  { figure: { kind: 'shape', value: 'square' }, palette: RED_GREEN },
  { figure: { kind: 'shape', value: 'star' }, palette: RED_GREEN },
  { figure: { kind: 'shape', value: 'nothing' }, palette: PINK_GREEN },
  { figure: { kind: 'shape', value: 'circle' }, palette: RED_GREEN },
];

const OPTIONS: { value: Shape; label: string }[] = [
  { value: 'star', label: 'Star' },
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'nothing', label: 'Nothing' },
];

type Answer = { plate: number; shown: Shape; answer: Shape };

export function KidsColourShapes({ eye, onExit, onDone }: TestProps) {
  const { width } = useWindowDimensions();
  const size = Math.min(300, width - Spacing.xl * 2);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Shape | null>(null);
  const answers = useRef<Answer[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const plate = PLATES[index];

  function pick(answer: Shape) {
    if (picked) return;
    setPicked(answer);
    answers.current.push({ plate: index + 1, shown: plate.figure.value as Shape, answer });
    timer.current = setTimeout(() => {
      if (index === PLATES.length - 1) onDone({ plates: answers.current });
      else {
        setIndex(index + 1);
        setPicked(null);
      }
    }, 700);
  }

  return (
    <View style={styles.root}>
      <TestHeader
        title="Kids · Colour shapes"
        onExit={onExit}
        eyeLabel={EYE_LABEL[eye]}
        progress={`Plate ${index + 1} of ${PLATES.length}`}
      />
      <Mascot text={picked ? 'Great looking! On to the next one.' : 'What shape is hiding in the dots?'} pop={!!picked} />

      <View style={[styles.plate, { width: size, height: size, borderRadius: size / 2 }]}>
        <PlateView key={index} figure={plate.figure} palette={plate.palette} seed={29 + index * 5} size={size} />
      </View>

      <View style={styles.spacer} />
      <View style={styles.grid}>
        {OPTIONS.map((o) => {
          const on = picked === o.value;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="button"
              onPress={() => pick(o.value)}
              style={({ pressed }) => [styles.option, on && styles.on, pressed && styles.pressed]}>
              <Icon name={o.value} size={28} color={on ? Colors.white : Colors.ink} />
              <Text style={[styles.label, on && styles.onText]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <ParentNote />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  plate: { marginTop: 16, alignSelf: 'center', overflow: 'hidden' },
  spacer: { flex: 1, minHeight: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: {
    width: '48.5%',
    flexGrow: 1,
    height: 72,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: { fontFamily: Fonts.semibold, fontSize: 18, color: Colors.ink },
  on: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  onText: { color: Colors.white },
  pressed: { transform: [{ scale: 0.98 }] },
});
