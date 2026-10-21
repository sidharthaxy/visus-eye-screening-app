import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Colors } from '@/constants/theme';

type Props = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
};

const THUMB = 22;

/** Horizontal slider (black fill, black thumb). Tap or drag anywhere on it. */
export function Slider({ value, min, max, onChange, accessibilityLabel }: Props) {
  const [width, setWidth] = useState(0);
  const ratio = max > min ? (value - min) / (max - min) : 0;

  const fromX = (x: number) => {
    const usable = width - THUMB;
    if (usable <= 0) return;
    const r = Math.min(1, Math.max(0, (x - THUMB / 2) / usable));
    onChange(Math.round(min + r * (max - min)));
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .onBegin((e) => fromX(e.x))
    .onUpdate((e) => fromX(e.x));

  return (
    <GestureDetector gesture={pan}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min, max, now: value }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => onChange(Math.min(max, Math.max(min, value + (e.nativeEvent.actionName === 'increment' ? 1 : -1))))}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={styles.root}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: THUMB / 2 + ratio * (width - THUMB) }]} />
        </View>
        <View style={[styles.thumb, { left: ratio * (width - THUMB) }]} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, height: 44, justifyContent: 'center' },
  track: { height: 4, borderRadius: 2, backgroundColor: Colors.borderOption, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: Colors.ink },
  thumb: { position: 'absolute', width: THUMB, height: THUMB, borderRadius: THUMB / 2, backgroundColor: Colors.ink },
});
