// The Tumbling E chart shared by Distance acuity (26) and Kids Tumbling E (34).
// The app only runs the chart (next line after 3 right, stop after 3 wrong);
// the server turns the trials into an acuity score.
import { useMemo, useRef, useState } from 'react';
import { PixelRatio, StyleSheet, View } from 'react-native';

import { DISTANCE_CM, usePxPerMm, type Answers } from '@/tests/parts';

export type Dir = 'right' | 'down' | 'left' | 'up';
export const ROTATION: Record<Dir, number> = { right: 0, down: 90, left: 180, up: 270 };
const DIRS: Dir[] = ['right', 'down', 'left', 'up'];

/** Snellen lines 6/60 … 6/5, as in the design. */
const SNELLEN = [60, 36, 24, 18, 12, 9, 6, 5];
/** Letters per line, and right (or wrong) answers that end a line. Quick check: shorter chart from 6/12. */
const FULL = { from: 0, perLine: 5, toPass: 3 };
const QUICK = { from: SNELLEN.indexOf(12), perLine: 3, toPass: 2 };

type Line = { snellen: string; /** One stroke of the E, in points (whole device pixels). */ unit: number; sizeMm: number };

/**
 * E height for 6/X at the viewing distance: 5 arcminutes at 6/6, scaled by X/6.
 * Rounded to whole device pixels so each stroke is sharp; lines that round to the
 * same size as a bigger line can't be shown on this screen and are left out.
 */
function buildLines(pxPerMm: number, maxLines: number, from: number): Line[] {
  const scale = PixelRatio.get();
  const lines: Line[] = [];
  for (const x of SNELLEN.slice(0, maxLines).slice(from)) {
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

/**
 * Runs the chart. `answer` returns what happened: the next letter, a new line,
 * the end of the chart, or null while the short blank between letters shows.
 */
export function useEChart(maxLines: number, onDone: (answers: Answers) => void, quick = false) {
  const { pxPerMm, calibrated } = usePxPerMm();
  const { from, perLine, toPass } = quick ? QUICK : FULL;
  const lines = useMemo(() => buildLines(pxPerMm, maxLines, from), [pxPerMm, maxLines, from]);

  const [line, setLine] = useState(0);
  const [pos, setPos] = useState(0);
  const [shown, setShown] = useState<Dir>(() => randomDir());
  // Short blank between letters so a new E is noticed.
  const [blank, setBlank] = useState(false);
  const [count, setCount] = useState(0);
  const busy = useRef(false);
  const tally = useRef({ right: 0, wrong: 0 });
  const trials = useRef<Trial[]>([]);

  function answer(dir: Dir): 'letter' | 'line' | 'done' | null {
    if (busy.current) return null;
    const current = lines[line];
    trials.current.push({ line: current.snellen, sizeMm: current.sizeMm, shown, answer: dir });
    setCount(trials.current.length);
    const t = tally.current;
    if (dir === shown) t.right += 1;
    else t.wrong += 1;

    const lastLine = line === lines.length - 1;
    if (t.wrong >= toPass || (t.right >= toPass && lastLine)) {
      busy.current = true;
      onDone({ distanceCm: DISTANCE_CM, pxPerMm, calibrated, quick, trials: trials.current });
      return 'done';
    }
    const nextLine = t.right >= toPass;
    if (nextLine) {
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
    return nextLine ? 'line' : 'letter';
  }

  return { lines, line, current: lines[line], pos, perLine, shown, blank, count, answer };
}

/** The E as three bars and a spine, legs pointing right before rotation. */
export function LetterE({ unit, dir }: { unit: number; dir: Dir }) {
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
  bar: { position: 'absolute', backgroundColor: '#000000' },
});
