// Screen 33: Colour vision plates. 12 dot plates, each hiding a number; pick
// what you see. The first plate is a demo everyone should read.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { TestHeader } from '@/components/TestHeader';
import { Text } from '@/components/Text';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { EYE_LABEL, TestQuestion, type TestProps } from '@/tests/parts';
import { DEMO, RED_GREEN, type Palette } from '@/tests/plates';
import { PlateView } from '@/tests/PlateView';

/** Number shown and the 4 choices (the right one plus common misreadings). */
const PLATES: { value: string; options: string[]; palette: Palette }[] = [
  { value: '12', options: ['12', '17', '72', '15'], palette: DEMO },
  { value: '74', options: ['74', '21', '71', '14'], palette: RED_GREEN },
  { value: '6', options: ['6', '5', '8', '9'], palette: RED_GREEN },
  { value: '29', options: ['29', '70', '28', '79'], palette: RED_GREEN },
  { value: '57', options: ['57', '35', '51', '37'], palette: RED_GREEN },
  { value: '5', options: ['5', '2', '6', '3'], palette: RED_GREEN },
  { value: '3', options: ['3', '5', '8', '2'], palette: RED_GREEN },
  { value: '15', options: ['15', '17', '16', '13'], palette: RED_GREEN },
  { value: '7', options: ['7', '1', '4', '2'], palette: RED_GREEN },
  { value: '16', options: ['16', '18', '10', '15'], palette: RED_GREEN },
  { value: '45', options: ['45', '46', '15', '48'], palette: RED_GREEN },
  { value: '73', options: ['73', '78', '13', '75'], palette: RED_GREEN },
];

/** Same order every time for a plate, but the right answer moves around. */
const ordered = (options: string[], plate: number) => options.map((_, i) => options[(i + plate * 3 + 1) % options.length]);

type Answer = { plate: number; shown: string; answer: string | null };

export function ColourPlates({ eye, onExit, onDone }: TestProps) {
  const { width } = useWindowDimensions();
  const size = Math.min(300, width - Spacing.xl * 2);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const answers = useRef<Answer[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const plate = PLATES[index];
  const figure = useMemo(() => ({ kind: 'number' as const, value: plate.value }), [plate.value]);

  /** `null` = "I don't see a number". Moves on after a short pause so the choice is seen. */
  function pick(answer: string | null) {
    if (picked !== undefined) return;
    setPicked(answer);
    answers.current.push({ plate: index + 1, shown: plate.value, answer });
    timer.current = setTimeout(() => {
      if (index === PLATES.length - 1) onDone({ plates: answers.current });
      else {
        setIndex(index + 1);
        setPicked(undefined);
      }
    }, 380);
  }

  return (
    <View style={styles.root}>
      <TestHeader title="Colour vision" onExit={onExit} eyeLabel={EYE_LABEL[eye]} progress={`Plate ${index + 1} of ${PLATES.length}`} />
      <TestQuestion title="What number do you see?" />

      <View style={[styles.plate, { width: size, height: size, borderRadius: size / 2 }]}>
        <PlateView key={index} figure={figure} palette={plate.palette} seed={11 + index * 7} size={size} />
      </View>

      <View style={styles.spacer} />
      <View style={styles.grid}>
        {ordered(plate.options, index).map((option) => {
          const on = picked === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              onPress={() => pick(option)}
              style={({ pressed }) => [styles.option, on && styles.on, pressed && styles.pressed]}>
              <Text style={[styles.optionText, on && styles.onText]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => pick(null)}
        style={({ pressed }) => [styles.none, picked === null && styles.on, pressed && styles.pressed]}>
        <Text style={[styles.noneText, picked === null && styles.onText]}>I don&apos;t see a number</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  plate: { marginTop: 20, alignSelf: 'center', overflow: 'hidden' },
  spacer: { flex: 1, minHeight: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: {
    width: '48.5%',
    flexGrow: 1,
    height: 64,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.ink },
  none: {
    marginTop: 10,
    height: 56,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noneText: { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.ink },
  on: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  onText: { color: Colors.white },
  pressed: { transform: [{ scale: 0.98 }] },
});
