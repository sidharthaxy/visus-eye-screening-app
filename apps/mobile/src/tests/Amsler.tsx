// Screen 31: Amsler grid. Keep looking at the centre dot and mark the areas
// where lines look wavy, blurry or missing. Tap one area or drag across several.
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { TestHeader } from '@/components/TestHeader';
import { Colors } from '@/constants/theme';
import { COVER, EYE_LABEL, TestFooter, TestQuestion, type TestProps } from '@/tests/parts';

const GRID = 10;
const MARK = '#F6D3CD';
const LINE = '#111111';

export function Amsler({ eye, onExit, onDone }: TestProps) {
  const [marked, setMarked] = useState<boolean[]>(() => Array(GRID * GRID).fill(false));
  const [straight, setStraight] = useState(false);
  const [size, setSize] = useState(0);
  // Whether the current drag marks or clears, decided by the first area touched.
  const painting = useRef(true);

  const cellAt = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return -1;
    return Math.floor((y / size) * GRID) * GRID + Math.floor((x / size) * GRID);
  };
  const paint = (cell: number) => {
    if (cell < 0) return;
    setMarked((m) => (m[cell] === painting.current ? m : m.map((v, i) => (i === cell ? painting.current : v))));
  };

  const touch = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    // Gesture callbacks run on touch, not during render.
    // eslint-disable-next-line react-hooks/refs
    .onBegin((e) => {
      const cell = cellAt(e.x, e.y);
      if (cell < 0) return;
      painting.current = !marked[cell];
      setStraight(false);
      paint(cell);
    })
    .onUpdate((e) => paint(cellAt(e.x, e.y)));

  const count = marked.filter(Boolean).length;
  const summary = straight
    ? 'All lines look straight'
    : count
      ? `${count} ${count === 1 ? 'area' : 'areas'} marked`
      : 'Nothing marked yet';
  const cell = size / GRID;

  return (
    <View style={styles.root}>
      <TestHeader title="Amsler grid" onExit={onExit} eyeLabel={EYE_LABEL[eye]} progress={COVER[eye]} />
      <TestQuestion title="Keep looking at the dot" subtitle="Tap any areas where lines look wavy, blurry or missing." />

      <View
        style={styles.area}
        onLayout={(e) => setSize(Math.floor(Math.min(e.nativeEvent.layout.width, e.nativeEvent.layout.height)))}>
        {size > 0 && (
          <GestureDetector gesture={touch}>
            <View collapsable={false} style={[styles.grid, { width: size, height: size }]}>
              {marked.map((on, i) => (
                <View
                  key={i}
                  style={[
                    styles.cell,
                    { left: (i % GRID) * cell, top: Math.floor(i / GRID) * cell, width: cell, height: cell },
                    on && { backgroundColor: MARK },
                  ]}
                />
              ))}
              {Array.from({ length: GRID + 1 }, (_, k) => (
                <View key={`v${k}`} style={[styles.vLine, { left: Math.min(k * cell, size - 1), height: size }]} />
              ))}
              {Array.from({ length: GRID + 1 }, (_, k) => (
                <View key={`h${k}`} style={[styles.hLine, { top: Math.min(k * cell, size - 1), width: size }]} />
              ))}
              <View style={[styles.dot, { left: size / 2 - 6, top: size / 2 - 6 }]} />
            </View>
          </GestureDetector>
        )}
      </View>

      <TestFooter
        summary={summary}
        toggleLabel="All lines straight"
        toggled={straight}
        onToggle={() => {
          setStraight(!straight);
          setMarked(Array(GRID * GRID).fill(false));
        }}
        doneLabel="Done"
        canFinish={straight || count > 0}
        onDone={() =>
          onDone({
            gridSize: GRID,
            // Row-major from the top-left area: row * 10 + column.
            marked: marked.flatMap((on, i) => (on ? [i] : [])),
            allStraight: straight,
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  area: { flex: 1, minHeight: 0, marginTop: 16, alignItems: 'center' },
  grid: { backgroundColor: Colors.white },
  cell: { position: 'absolute' },
  vLine: { position: 'absolute', top: 0, width: 1, backgroundColor: LINE },
  hLine: { position: 'absolute', left: 0, height: 1, backgroundColor: LINE },
  dot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: LINE },
});
