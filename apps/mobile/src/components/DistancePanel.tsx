// The camera card + distance gauge shared by Distance setup (12) and Distance warning (47).
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { Colors, Fonts, StatusColors } from '@/constants/theme';

const MIN_CM = 15;
const RANGE_CM = 60;
const at = (cm: number) => `${Math.min(100, Math.max(0, ((cm - MIN_CM) / RANGE_CM) * 100))}%` as const;

export type DistanceState = 'none' | 'close' | 'far' | 'ok';

export function distanceState(cm: number | null, target: number): DistanceState {
  if (cm === null) return 'none';
  if (cm < target - 5) return 'close';
  if (cm > target + 5) return 'far';
  return 'ok';
}

const MESSAGE: Record<DistanceState, [string, string, string]> = {
  none: ['Looking for your face', Colors.pill, Colors.inkSoft],
  close: ['Move back a little', StatusColors.mild.bg, StatusColors.mild.fg],
  far: ['Move a bit closer', StatusColors.mild.bg, StatusColors.mild.fg],
  ok: ['Perfect, hold still', StatusColors.good.bg, StatusColors.good.fg],
};

/** `camera`: the live preview (Distance setup); without it the card stays dark (Distance warning). */
export function DistancePanel({ cm, target, camera }: { cm: number | null; target: number; camera?: ReactNode }) {
  const state = distanceState(cm, target);
  const [message, bg, fg] = MESSAGE[state];
  const scale = cm === null ? 1 : Math.min(1.35, Math.max(0.62, target / cm));
  return (
    <>
      <View style={styles.card}>
        {camera}
        <View style={styles.guide} />
        <View
          style={[
            styles.ring,
            { transform: [{ scale }], borderColor: state === 'ok' ? '#5FD08F' : Colors.white },
          ]}
        />
        <View style={[styles.pill, { backgroundColor: bg }]}>
          <View style={[styles.pillDot, { backgroundColor: fg }]} />
          <Text style={[styles.pillText, { color: fg }]}>{message}</Text>
        </View>
        <View style={styles.cameraLabel}>
          <View style={styles.cameraDot} />
          <Text style={styles.cameraText}>Front camera</Text>
        </View>
      </View>

      <View style={styles.readout}>
        <Text style={styles.cm}>{cm === null ? '– cm' : `${cm} cm`}</Text>
        <Text style={styles.aim}>
          Aim for {target - 5}–{target + 5} cm
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.zone, { left: at(target - 5), width: `${(10 / RANGE_CM) * 100}%` }]} />
        {cm !== null && <View style={[styles.knob, { left: at(cm) }]} />}
      </View>
      <View style={styles.ends}>
        <Text style={styles.end}>Closer</Text>
        <Text style={styles.end}>Further</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 16, height: 360, borderRadius: 28, backgroundColor: '#1F1F1E', overflow: 'hidden' },
  guide: {
    position: 'absolute',
    left: '50%',
    top: '52%',
    width: 190,
    height: 250,
    marginLeft: -95,
    marginTop: -125,
    borderRadius: 125,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.4)',
  },
  ring: { position: 'absolute', left: '50%', top: '52%', width: 176, height: 232, marginLeft: -88, marginTop: -116, borderRadius: 116, borderWidth: 2.5 },
  pill: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontFamily: Fonts.semibold, fontSize: 15 },
  cameraLabel: { position: 'absolute', left: 16, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  cameraDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.65)' },
  cameraText: { fontFamily: Fonts.semibold, fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  readout: { marginTop: 20, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  cm: { fontFamily: Fonts.bold, fontSize: 34, letterSpacing: -1, color: Colors.ink },
  aim: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted },
  track: { marginTop: 16, height: 8, borderRadius: 99, backgroundColor: Colors.border },
  zone: { position: 'absolute', top: 0, bottom: 0, borderRadius: 99, backgroundColor: '#BFE3CC' },
  knob: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 20,
    marginLeft: -10,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: Colors.white,
    backgroundColor: Colors.ink,
    elevation: 2,
  },
  ends: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  end: { fontFamily: Fonts.regular, fontSize: 12, color: '#8A8A85' },
});
