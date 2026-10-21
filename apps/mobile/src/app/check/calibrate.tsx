import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Slider } from '@/components/Slider';
import { Text } from '@/components/Text';
import { Colors, Fonts, Radius, Spacing, Type } from '@/constants/theme';
import { CARD_MM, useCalibration } from '@/store/calibration';
import { useCheck } from '@/store/check';

/** Android's nominal 160 dpi in points per mm: a good first guess before the user adjusts. */
const NOMINAL_PX_PER_MM = 160 / 25.4;
const MIN_WIDTH = 240;

/** Screen 11: Screen calibration. The card stands upright so its 53.98 mm short edge fits across the screen. */
export default function Calibrate() {
  const { width: screen } = useWindowDimensions();
  const saved = useCalibration((s) => s.cardWidth);
  const setCardWidth = useCalibration((s) => s.setCardWidth);
  const { plan, index } = useCheck();

  const maxWidth = Math.round(screen - Spacing.xl * 2 - 2 - 16);
  const clamp = (w: number) => Math.min(maxWidth, Math.max(MIN_WIDTH, w));
  const [width, setWidth] = useState(() => clamp(saved ?? Math.round(CARD_MM.short * NOMINAL_PX_PER_MM)));
  const height = width * (CARD_MM.long / CARD_MM.short);

  function done() {
    setCardWidth(width);
    const next = plan[index]?.testId;
    if (next) router.replace({ pathname: '/check/[testId]/instructions', params: { testId: next } });
    else router.back();
  }

  return (
    <Screen>
      <ScreenHeader left="back" onLeft={() => router.back()} title="Screen setup" />

      <View>
        <Text style={styles.title}>Match a bank card</Text>
        <Text style={styles.body}>
          Hold any bank card upright, flat on the screen. Drag the slider until the outline lines up with its edges.
        </Text>
      </View>

      <View style={styles.box}>
        {/* Upright card: top edge and both sides are visible, the bottom runs off the box. */}
        <View style={[styles.card, { width, height }]}>
          <View style={[styles.chip, { width: width * 0.2, height: width * 0.15, top: width * 0.14, left: width * 0.12 }]} />
          <View style={[styles.line, { width: width * 0.62, top: width * 0.5, left: width * 0.12 }]} />
          <View style={[styles.line, { width: width * 0.34, top: width * 0.5 + 16, left: width * 0.12 }]} />
        </View>
      </View>

      <View>
        <View style={styles.controls}>
          <Pressable
            accessibilityLabel="Smaller"
            onPress={() => setWidth((w) => clamp(w - 1))}
            style={({ pressed }) => [styles.step, pressed && styles.pressed]}>
            <Icon name="minus" size={18} />
          </Pressable>
          <Slider value={width} min={MIN_WIDTH} max={maxWidth} onChange={setWidth} accessibilityLabel="Card size" />
          <Pressable
            accessibilityLabel="Larger"
            onPress={() => setWidth((w) => clamp(w + 1))}
            style={({ pressed }) => [styles.step, pressed && styles.pressed]}>
            <Icon name="plusBold" size={18} />
          </Pressable>
        </View>
        <View style={styles.labels}>
          <Text style={styles.label}>Smaller</Text>
          <Text style={styles.label}>Larger</Text>
        </View>
      </View>

      <View style={styles.spacer} />
      <Button title="Done" onPress={done} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...Type.question, letterSpacing: -0.7, marginTop: 8, color: Colors.ink },
  body: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, marginTop: 8, color: Colors.muted },
  box: {
    marginTop: 8,
    height: 236,
    borderRadius: Radius.hero,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    paddingTop: 20,
    overflow: 'hidden',
  },
  card: { borderWidth: 2, borderColor: Colors.ink, borderRadius: 12 },
  chip: { position: 'absolute', borderWidth: 1.5, borderColor: Colors.dashed, borderRadius: 4 },
  line: { position: 'absolute', height: 6, borderRadius: 3, backgroundColor: Colors.border },
  controls: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  step: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.94 }] },
  labels: { marginTop: 2, paddingHorizontal: 56, flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontFamily: Fonts.regular, fontSize: 12, color: '#8A8A85' },
  spacer: { flex: 1 },
});
