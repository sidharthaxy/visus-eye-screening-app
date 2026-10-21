// Screen 28: Near point. Bring the phone closer until the text blurs, then
// say how far the phone was. The design reads the distance live from the
// camera; that needs a development build (Phase 3), so for now the user sets
// it on the slider and the answer says `distanceSource: "manual"`.
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Slider } from '@/components/Slider';
import { TestHeader } from '@/components/TestHeader';
import { FixedText, Text } from '@/components/Text';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { EYE_LABEL, TestCard, TestQuestion, usePxPerMm, type TestProps } from '@/tests/parts';

const NEAR_CM = 10;
const FAR_CM = 40;
/** Target text: N6 print (6 pt = 2.1 mm). */
const TEXT_MM = 6 * 0.3528;

export function NearPoint({ eye, onExit, onDone }: TestProps) {
  const { pxPerMm, calibrated } = usePxPerMm();
  const [stopped, setStopped] = useState(false);
  const [cm, setCm] = useState(20);
  const eyeName = eye === 'left' ? 'left' : 'right';

  return (
    <View style={styles.root}>
      <TestHeader title="Near point" onExit={onExit} eyeLabel={EYE_LABEL[eye]} progress="Glasses on" />
      <TestQuestion
        title={stopped ? 'How far was the phone?' : 'Bring the phone closer'}
        subtitle={
          stopped
            ? `Measure from your ${eyeName} eye to the screen, or estimate it.`
            : 'Move slowly. Stop when the text starts to blur.'
        }
      />

      <TestCard style={styles.card}>
        {stopped && (
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>{cm} cm</Text>
          </View>
        )}
        <FixedText style={[styles.target, { fontSize: TEXT_MM * pxPerMm }]}>Read this line as you move closer</FixedText>
      </TestCard>

      {stopped && (
        <>
          <View style={styles.track}>
            {/* Left end is 40 cm, as in the design. */}
            <Slider
              value={FAR_CM + NEAR_CM - cm}
              min={NEAR_CM}
              max={FAR_CM}
              onChange={(v) => setCm(FAR_CM + NEAR_CM - v)}
              accessibilityLabel="Distance from your eye"
            />
          </View>
          <View style={styles.ends}>
            <Text style={styles.endText}>{FAR_CM} cm</Text>
            <Text style={styles.endText}>{NEAR_CM} cm</Text>
          </View>
        </>
      )}

      {stopped ? (
        <>
          <Button
            title="Continue"
            onPress={() =>
              onDone({
                blurCm: cm,
                distanceSource: 'manual',
                textSizeMm: Number(TEXT_MM.toFixed(2)),
                pxPerMm,
                calibrated,
              })
            }
            style={styles.main}
          />
          <Button title="Start over" variant="ghost" onPress={() => setStopped(false)} style={styles.again} />
        </>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => setStopped(true)}
          style={({ pressed }) => [styles.blurry, pressed && styles.pressed]}>
          <Icon name="eyeOff" size={22} color={Colors.white} />
          <Text style={styles.blurryText}>It&apos;s blurry now</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { marginTop: 16 },
  badge: {
    position: 'absolute',
    top: 18,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.white },
  badgeText: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white, fontVariant: ['tabular-nums'] },
  target: { fontFamily: Fonts.medium, color: Colors.ink, textAlign: 'center', paddingHorizontal: 12 },
  track: { marginTop: 18 },
  ends: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  endText: { fontFamily: Fonts.regular, fontSize: 12, color: '#8A8A85' },
  main: { marginTop: 18, height: 68, borderRadius: 18 },
  again: { marginTop: 4 },
  blurry: {
    marginTop: 18,
    height: 68,
    borderRadius: 18,
    backgroundColor: Colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  blurryText: { fontFamily: Fonts.semibold, fontSize: 19, color: Colors.white },
});
