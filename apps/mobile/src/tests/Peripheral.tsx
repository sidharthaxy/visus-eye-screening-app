// Screen 57: Peripheral vision (dot field). Keep looking at the centre dot;
// 24 dots flash around it, one at a time, and you tap "I saw it". The app
// records which dots were seen and where (mm from the centre at 30 cm); the
// server maps the field.
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TestHeader } from '@/components/TestHeader';
import { Colors, Fonts } from '@/constants/theme';
import { EYE_LABEL, usePxPerMm, type TestProps } from '@/tests/parts';

/** Order of the 24 positions (every 15°), from the design. */
const ORDER = [0, 9, 17, 4, 13, 21, 6, 2, 11, 19, 8, 15, 1, 23, 10, 5, 18, 12, 3, 20, 7, 16, 22, 14];
const DISTANCE_CM = 30;
/** Dot about 0.43° wide at 30 cm (like a Goldmann size III target). */
const DOT_MM = 2.25;
const SHOW_MS = 400;
/** A tap counts for a dot until this long after it appears. */
const WINDOW_MS = 1500;

type Trial = { angleDeg: number; xMm: number; yMm: number; seen: boolean; reactionMs: number | null };

export function Peripheral({ eye, onExit, onDone }: TestProps) {
  const { pxPerMm, calibrated } = usePxPerMm();
  const [field, setField] = useState({ w: 0, h: 0 });
  const [n, setN] = useState(0);
  const [visible, setVisible] = useState(false);
  const [hit, setHit] = useState(false);
  const open = useRef<{ at: number; trial: Trial } | null>(null);
  const trials = useRef<Trial[]>([]);
  const falseTaps = useRef(0);
  const hitTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Where dot `n` goes: on an ellipse filling the field, inner or outer ring.
  const slot = ORDER[n];
  const angle = (slot * 15 * Math.PI) / 180;
  const ring = slot % 2 ? 0.8 : 0.96;
  const dx = Math.cos(angle) * field.w * 0.44 * ring;
  const dy = Math.sin(angle) * field.h * 0.44 * ring;
  const dot = DOT_MM * pxPerMm;

  const finish = useEffectEvent((trial: Trial) => {
    trials.current.push(trial);
    if (n < ORDER.length - 1) setN(n + 1);
    else
      onDone({
        distanceCm: DISTANCE_CM,
        pxPerMm,
        calibrated,
        dotMm: DOT_MM,
        trials: trials.current,
        falseTaps: falseTaps.current,
      });
  });
  const show = useEffectEvent(() => {
    const trial: Trial = {
      angleDeg: slot * 15,
      xMm: Number((dx / pxPerMm).toFixed(1)),
      yMm: Number((dy / pxPerMm).toFixed(1)),
      seen: false,
      reactionMs: null,
    };
    open.current = { at: Date.now(), trial };
    setVisible(true);
  });

  // One trial: random pause, flash the dot, then close the answer window.
  useEffect(() => {
    if (!field.w) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(
      setTimeout(
        () => {
          show();
          timers.push(setTimeout(() => setVisible(false), SHOW_MS));
          timers.push(
            setTimeout(() => {
              const trial = open.current?.trial;
              open.current = null;
              if (trial) finish(trial);
            }, WINDOW_MS),
          );
        },
        900 + Math.random() * 800,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [n, field.w]);

  useEffect(() => () => clearTimeout(hitTimer.current), []);

  function saw() {
    const current = open.current;
    if (current && !current.trial.seen) {
      current.trial.seen = true;
      current.trial.reactionMs = Date.now() - current.at;
    } else {
      falseTaps.current += 1;
    }
    setHit(true);
    clearTimeout(hitTimer.current);
    hitTimer.current = setTimeout(() => setHit(false), 450);
  }

  return (
    <View style={styles.root}>
      <TestHeader title="Peripheral vision" onExit={onExit} eyeLabel={EYE_LABEL[eye]} progress={`Dot ${n + 1} of ${ORDER.length}`} />
      <Text style={styles.title}>Keep looking at the dot.</Text>

      <View style={styles.field} onLayout={(e) => setField({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {field.w > 0 && (
          <>
            <View style={[styles.ring, { left: field.w / 2 - 22, top: field.h / 2 - 22 }]} />
            <View style={[styles.fixation, { left: field.w / 2 - 7, top: field.h / 2 - 7 }]} />
            {visible && (
              <View
                style={[
                  styles.stimulus,
                  { width: dot, height: dot, borderRadius: dot / 2, left: field.w / 2 + dx - dot / 2, top: field.h / 2 + dy - dot / 2 },
                ]}
              />
            )}
          </>
        )}
      </View>

      <Pressable accessibilityRole="button" onPress={saw} style={[styles.button, hit && styles.buttonHit]}>
        <Text style={styles.buttonText}>{hit ? 'Got it' : 'I saw it'}</Text>
      </Pressable>
      <Text style={styles.note}>Tap whenever a dot flashes. Don&apos;t move your eyes.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: { marginTop: 18, textAlign: 'center', fontFamily: Fonts.bold, fontSize: 20, letterSpacing: -0.2, color: Colors.ink },
  field: { flex: 1, minHeight: 0, marginTop: 8 },
  ring: { position: 'absolute', width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: Colors.borderOption },
  fixation: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.ink },
  stimulus: { position: 'absolute', backgroundColor: Colors.ink },
  button: { height: 96, borderRadius: 24, backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center' },
  buttonHit: { backgroundColor: Colors.inkSoft },
  buttonText: { fontFamily: Fonts.bold, fontSize: 22, letterSpacing: -0.2, color: Colors.white },
  note: { marginTop: 12, textAlign: 'center', fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted },
});
