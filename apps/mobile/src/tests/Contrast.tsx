// Screen 32: Contrast sensitivity. Six letters, each fainter than the last;
// tap the faintest one you can see. Letters are 5 mm tall (from calibration),
// big enough that contrast, not sharpness, decides what you see.
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { TestHeader } from '@/components/TestHeader';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { DISTANCE_CM, EYE_LABEL, TestCard, TestFooter, TestQuestion, usePxPerMm, type TestProps } from '@/tests/parts';

const LETTERS = ['H', 'O', 'V', 'K', 'Z', 'N'];
/** Darker to fainter, on white, as in the design. */
const SHADES = ['#111111', '#888888', '#C4C4C4', '#E1E1E1', '#F1F1F1', '#F8F8F8'];
const LETTER_MM = 5;
/** Figtree capital height as a share of the font size. */
const CAP_HEIGHT = 0.7;

/** Weber contrast of an sRGB grey on white: 1 − its relative luminance. Describes what was shown. */
function contrastOnWhite(hex: string) {
  const v = parseInt(hex.slice(1, 3), 16) / 255;
  const linear = v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  return Number((1 - linear).toFixed(3));
}

const shuffle = <T,>(list: T[]) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export function Contrast({ eye, onExit, onDone }: TestProps) {
  const { pxPerMm, calibrated } = usePxPerMm();
  const { width } = useWindowDimensions();
  // Letters in a new order each time, so they can't be remembered.
  const letters = useMemo(() => shuffle(LETTERS), []);
  const [picked, setPicked] = useState<number | null>(null);
  const [none, setNone] = useState(false);

  // Card: 20px gutters, 1px border, 12px padding, 5 gaps of 6px.
  const cellWidth = (width - Spacing.xl * 2 - 2 - 24 - 30) / 6;
  const fontSize = Math.min((LETTER_MM / CAP_HEIGHT) * pxPerMm, cellWidth * 0.85);

  const summary = none
    ? "Can't see any letters"
    : picked === null
      ? 'Letters get fainter left to right'
      : `Faintest seen: letter ${picked + 1} of 6`;

  return (
    <View style={styles.root}>
      <TestHeader title="Contrast sensitivity" onExit={onExit} eyeLabel={EYE_LABEL[eye]} progress="Hold at 40 cm" />
      <TestQuestion title="Tap the faintest letter you can see" />

      <TestCard style={styles.card}>
        <View style={styles.row}>
          {letters.map((letter, i) => {
            const on = picked === i;
            return (
              <Pressable
                key={letter}
                accessibilityRole="button"
                accessibilityLabel={`Letter ${i + 1}`}
                onPress={() => {
                  setPicked(on ? null : i);
                  setNone(false);
                }}
                style={[styles.cell, on && styles.cellOn]}>
                <Text style={[styles.letter, { fontSize, color: SHADES[i] }]}>{letter}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.legend}>
          <Text style={styles.legendText}>Darker</Text>
          <Svg style={styles.ramp} height={1}>
            <Defs>
              <LinearGradient id="ramp" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#111111" />
                <Stop offset="1" stopColor="#F2F2EF" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height={1} fill="url(#ramp)" />
          </Svg>
          <Text style={styles.legendText}>Fainter</Text>
        </View>
      </TestCard>

      <TestFooter
        summary={summary}
        toggleLabel="Can't see any"
        toggled={none}
        onToggle={() => {
          setNone(!none);
          setPicked(null);
        }}
        doneLabel="Next"
        canFinish={none || picked !== null}
        onDone={() =>
          onDone({
            distanceCm: DISTANCE_CM,
            pxPerMm,
            calibrated,
            letterHeightMm: Number(((fontSize * CAP_HEIGHT) / pxPerMm).toFixed(2)),
            // Darker to fainter.
            letters: letters.map((letter, i) => ({ letter, color: SHADES[i], contrast: contrastOnWhite(SHADES[i]) })),
            // Index into `letters`, or null.
            faintestSeen: picked,
            noneSeen: none,
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { marginTop: 16, padding: 12, alignItems: 'stretch' },
  row: { flexDirection: 'row', gap: 6 },
  cell: {
    flex: 1,
    height: 92,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellOn: { borderColor: Colors.ink, backgroundColor: Colors.cardHover },
  letter: { fontFamily: Fonts.bold, includeFontPadding: false },
  legend: { marginTop: 18, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendText: { fontFamily: Fonts.semibold, fontSize: 12, color: '#8A8A85' },
  ramp: { flex: 1 },
});
