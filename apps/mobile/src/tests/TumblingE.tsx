// Screen 26: Distance acuity (Tumbling E). One E at a time, smaller each
// line. The app only runs the chart (next line after 3 right, stop after
// 3 wrong); the server turns the trials into an acuity score.
import { useMemo, useRef, useState } from 'react';
import { PixelRatio, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Icon } from '@/components/Icon';
import { TestHeader } from '@/components/TestHeader';
import { Colors, Fonts } from '@/constants/theme';
import { useCalibration } from '@/store/calibration';
import { DISTANCE_CM, EYE_LABEL, TestCard, type TestProps } from '@/tests/parts';

type Dir = 'right' | 'down' | 'left' | 'up';
const ROTATION: Record<Dir, number> = { right: 0, down: 90, left: 180, up: 270 };
const DIRS: Dir[] = ['right', 'down', 'left', 'up'];
/** Answer buttons, in the design's order. */
const BUTTONS: Dir[] = ['left', 'up', 'down', 'right'];

/** Snellen lines 6/60 … 6/5, as in the design. */
const SNELLEN = [60, 36, 24, 18, 12, 9, 6, 5];
const PER_LINE = 5;
const TO_PASS = 3;

/** Fallback when the screen isn't calibrated: a typical 160 dpi. */
const DEFAULT_PX_PER_MM = 160 / 25.4;

type Line = { snellen: string; /** One stroke of the E, in points (whole device pixels). */ unit: number; sizeMm: number };

/**
 * E height for 6/X at the viewing distance: 5 arcminutes at 6/6, scaled by X/6.
 * Rounded to whole device pixels so each stroke is sharp; lines that round to the
 * same size as a bigger line can't be shown on this screen and are left out.
 */
function buildLines(pxPerMm: number): Line[] {
  const scale = PixelRatio.get();
  const lines: Line[] = [];
  for (const x of SNELLEN) {
    const mm = DISTANCE_CM * 10 * Math.tan(((5 * x) / 6 / 60) * (Math.PI / 180));
    const unit = Math.max(1, Math.round(((mm * pxPerMm) / 5) * scale)) / scale;
    if (lines.length && lines[lines.length - 1].unit === unit) continue;
    lines.push({ snellen: `6/${x}`, unit, sizeMm: Number(((unit * 5) / pxPerMm).toFixed(2)) });
  }
  return lines;
}

const randomDir = (not?: Dir) => {
  const options = DIRS.filter((d) => d !== not);
  return options[Math.floor(Math.random() * options.length)];
};

type Trial = { line: string; sizeMm: number; shown: Dir; answer: Dir };

export function TumblingE({ eye, onExit, onDone }: TestProps) {
  const calibrated = useCalibration((s) => s.pxPerMm);
  const pxPerMm = calibrated ?? DEFAULT_PX_PER_MM;
  const lines = useMemo(() => buildLines(pxPerMm), [pxPerMm]);

  const [line, setLine] = useState(0);
  const [pos, setPos] = useState(0);
  const [shown, setShown] = useState<Dir>(() => randomDir());
  // Short blank between letters so a new E is noticed.
  const [blank, setBlank] = useState(false);
  const busy = useRef(false);
  const tally = useRef({ right: 0, wrong: 0 });
  const trials = useRef<Trial[]>([]);

  function answer(dir: Dir) {
    if (busy.current) return;
    const current = lines[line];
    trials.current.push({ line: current.snellen, sizeMm: current.sizeMm, shown, answer: dir });
    const t = tally.current;
    if (dir === shown) t.right += 1;
    else t.wrong += 1;

    const lastLine = line === lines.length - 1;
    if (t.wrong >= TO_PASS || (t.right >= TO_PASS && lastLine)) {
      busy.current = true;
      onDone({ distanceCm: DISTANCE_CM, pxPerMm, calibrated: calibrated !== null, trials: trials.current });
      return;
    }
    if (t.right >= TO_PASS) {
      tally.current = { right: 0, wrong: 0 };
      setLine(line + 1);
      setPos(0);
    } else {
      setPos(pos + 1);
    }
    busy.current = true;
    setBlank(true);
    setShown(randomDir(shown));
    setTimeout(() => {
      busy.current = false;
      setBlank(false);
    }, 250);
  }

  const swipe = Gesture.Pan()
    .runOnJS(true)
    // Gesture callbacks run on touch, not during render.
    // eslint-disable-next-line react-hooks/refs
    .onEnd((e) => {
      const { translationX: x, translationY: y } = e;
      if (Math.max(Math.abs(x), Math.abs(y)) < 30) return;
      if (Math.abs(x) > Math.abs(y)) answer(x > 0 ? 'right' : 'left');
      else answer(y > 0 ? 'down' : 'up');
    });

  const current = lines[line];

  return (
    <View style={styles.root}>
      <TestHeader
        title="Distance acuity"
        onExit={onExit}
        eyeLabel={EYE_LABEL[eye]}
        progress={`Line ${line + 1} of ${lines.length} · ${current.snellen}`}
      />

      <GestureDetector gesture={swipe}>
        <TestCard>{!blank && <LetterE unit={current.unit} dir={shown} />}</TestCard>
      </GestureDetector>

      <View style={styles.dots}>
        {Array.from({ length: PER_LINE }, (_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i < pos ? Colors.ink : i === pos ? Colors.acc : Colors.borderOption }]}
          />
        ))}
      </View>

      <Text style={styles.question}>Which way is the E pointing?</Text>
      <View style={styles.buttons}>
        {BUTTONS.map((dir) => (
          <Pressable
            key={dir}
            accessibilityRole="button"
            accessibilityLabel={dir[0].toUpperCase() + dir.slice(1)}
            onPress={() => answer(dir)}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
            <View style={{ transform: [{ rotate: `${ROTATION[dir]}deg` }] }}>
              <Icon name="arrow" size={30} strokeWidth={2.4} />
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.note}>
        <Icon name="armsLength" size={16} color={Colors.muted} />
        <Text style={styles.noteText}>Hold the phone at arm&apos;s length, about 40 cm</Text>
      </View>
    </View>
  );
}

/** The E as three bars and a spine, legs pointing right before rotation. */
function LetterE({ unit, dir }: { unit: number; dir: Dir }) {
  const size = unit * 5;
  return (
    <View style={{ width: size, height: size, transform: [{ rotate: `${ROTATION[dir]}deg` }] }}>
      <View style={[styles.bar, { left: 0, top: 0, width: unit, height: size }]} />
      {[0, 2, 4].map((row) => (
        <View key={row} style={[styles.bar, { left: 0, top: row * unit, width: size, height: unit }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bar: { position: 'absolute', backgroundColor: '#000000' },
  dots: { marginTop: 14, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  question: { marginTop: 14, textAlign: 'center', fontFamily: Fonts.semibold, fontSize: 16, color: Colors.ink },
  buttons: { marginTop: 12, flexDirection: 'row', gap: 10 },
  button: {
    flex: 1,
    height: 76,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { backgroundColor: Colors.fill, transform: [{ scale: 0.94 }] },
  note: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  noteText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted },
});
