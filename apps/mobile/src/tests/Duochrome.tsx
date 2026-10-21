// Screen 30: Red-green duochrome. Compare the black letters on red and on
// green; the server reads whether focus falls in front of or behind the eye.
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { TestHeader } from '@/components/TestHeader';
import { Colors, Fonts, Spacing, TextSizes } from '@/constants/theme';
import { EYE_LABEL, TestQuestion, type TestProps } from '@/tests/parts';

const RED = '#D8432F';
const GREEN = '#2E9A50';
const SIZES = [52, 36, 26, 18];
const LETTERS = {
  red: ['Z', 'HN', 'CKR', 'DOVS'],
  green: ['H', 'DK', 'NZO', 'SCRV'],
};

type Clearer = 'red' | 'same' | 'green';
const OPTIONS: { value: Clearer; label: string }[] = [
  { value: 'red', label: 'Red side clearer' },
  { value: 'same', label: 'Same' },
  { value: 'green', label: 'Green side clearer' },
];

export function Duochrome({ eye, onExit, onDone }: TestProps) {
  const [picked, setPicked] = useState<Clearer | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function pick(value: Clearer) {
    if (picked) return;
    setPicked(value);
    timer.current = setTimeout(() => onDone({ clearer: value }), 380);
  }

  return (
    <View style={styles.root}>
      <TestHeader title="Red-green test" onExit={onExit} eyeLabel={EYE_LABEL[eye]} progress="Glasses on" />
      <TestQuestion title="Which side looks clearer?" subtitle="Compare the black letters on each side." />

      <View style={styles.panel}>
        {(['red', 'green'] as const).map((side) => (
          <View key={side} style={[styles.half, { backgroundColor: side === 'red' ? RED : GREEN }]}>
            {LETTERS[side].map((text, i) => (
              <Text key={text} style={[styles.letters, { fontSize: SIZES[i], letterSpacing: SIZES[i] * 0.14 }]}>
                {text}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.options}>
        {OPTIONS.map((o) => {
          const on = picked === o.value;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => pick(o.value)}
              style={[styles.option, on && styles.optionOn]}>
              <View style={styles.swatch}>
                {o.value !== 'green' && <View style={[styles.swatchHalf, { backgroundColor: RED }]} />}
                {o.value !== 'red' && <View style={[styles.swatchHalf, { backgroundColor: GREEN }]} />}
              </View>
              <Text style={styles.label}>{o.label}</Text>
              <View style={[styles.radio, on && styles.radioOn]}>
                {on && <Icon name="check" size={12} color={Colors.white} strokeWidth={2.4} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  panel: { flex: 1, minHeight: 0, marginTop: 16, marginHorizontal: -Spacing.xl, flexDirection: 'row' },
  half: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  letters: { fontFamily: Fonts.bold, color: Colors.ink, includeFontPadding: false },
  options: { marginTop: 16, gap: 10 },
  option: {
    minHeight: 56,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderOption,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionOn: { borderWidth: 2, borderColor: Colors.ink, paddingHorizontal: 15 },
  swatch: { width: 22, height: 22, borderRadius: 11, overflow: 'hidden', flexDirection: 'row' },
  swatchHalf: { flex: 1 },
  label: { flex: 1, fontFamily: Fonts.medium, fontSize: TextSizes.normal.optionFont, color: Colors.ink },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CFCFCA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: Colors.ink, backgroundColor: Colors.ink },
});
