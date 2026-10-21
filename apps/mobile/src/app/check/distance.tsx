import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { DistanceCamera } from '@/components/DistanceCamera';
import { DistancePanel, distanceState } from '@/components/DistancePanel';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { Colors, Fonts } from '@/constants/theme';
import { firstStep, useCheck } from '@/store/check';

const TARGET_CM = 40;

/** Screen 12: Distance setup. The front camera measures how far the face is; Continue at 35–45 cm. */
export default function DistanceSetup() {
  const [cm, setCm] = useState<number | null>(null);
  const onDistance = useCallback((d: number | null) => setCm(d), []);
  const ok = distanceState(cm, TARGET_CM) === 'ok';

  function next() {
    useCheck.setState({ distanceSet: true });
    router.replace(firstStep());
  }

  return (
    <Screen>
      <View style={styles.root}>
        <ScreenHeader left="back" onLeft={() => router.back()} title="Distance" right={<Text style={styles.step}>2 of 2</Text>} />
        <DistancePanel cm={cm} target={TARGET_CM} camera={<DistanceCamera preview onDistance={onDistance} style={StyleSheet.absoluteFill} />} />
        <View style={styles.spacer} />
        <View style={styles.note}>
          <Icon name="lock" size={16} color={Colors.muted} strokeWidth={1.9} />
          <Text style={styles.noteText}>Only used to measure distance. Nothing is saved.</Text>
        </View>
        <Button title="Continue" disabled={!ok} onPress={next} />
        {/* No camera permission, or the face isn't found: the tests still work. */}
        <Pressable accessibilityRole="button" onPress={next} style={styles.skip}>
          <Text style={styles.skipText}>Continue without the camera</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  step: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.muted, textAlign: 'right' },
  spacer: { flex: 1, minHeight: 12 },
  note: { marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  noteText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted },
  skip: { marginTop: 4, height: 40, alignItems: 'center', justifyContent: 'center' },
  skipText: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.muted },
});
