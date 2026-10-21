// Pieces shared by Test result detail (18) and Single test complete (48).
import type { EyeResult, ScoredResult, Status } from '@visus/shared';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Colors, Fonts, Radius, StatusColors } from '@/constants/theme';

/** Bar colour per status: accent when good, the status colour otherwise. */
const barColor = (status: Status) => (status === 'good' ? Colors.acc : StatusColors[status].dot);

type Eyes = NonNullable<ScoredResult['eyes']>;
/** Left first, as in the design. */
function sides(eyes: Eyes) {
  const out: [string, EyeResult][] = [];
  if (eyes.left) out.push(['Left eye', eyes.left]);
  if (eyes.right) out.push(['Right eye', eyes.right]);
  return out;
}

/** Screen 18 "Left vs right": one row per eye with value and bar. */
export function EyeBars({ eyes }: { eyes: Eyes }) {
  return (
    <View style={styles.barsCard}>
      {sides(eyes).map(([label, e], i) => (
        <View key={label} style={[styles.barRow, i > 0 && styles.divider]}>
          <View style={styles.barTop}>
            <Text style={styles.barLabel}>{label}</Text>
            <Text style={styles.barValue}>{e.value}</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${e.score}%`, backgroundColor: barColor(e.status) }]} />
          </View>
          {e.detail && <Text style={[styles.detail, { color: StatusColors[e.status].fg }]}>{e.detail}</Text>}
        </View>
      ))}
    </View>
  );
}

/** Screen 48 "Left vs right": two cards side by side. */
export function EyeCards({ eyes }: { eyes: Eyes }) {
  return (
    <View style={styles.cards}>
      {sides(eyes).map(([label, e]) => (
        <View key={label} style={styles.eyeCard}>
          <Text style={styles.eyeCardLabel}>{label}</Text>
          <Text style={styles.eyeCardValue} numberOfLines={1} adjustsFontSizeToFit>
            {e.value}
          </Text>
          <View style={[styles.track, styles.trackThin]}>
            <View style={[styles.fill, { width: `${e.score}%`, backgroundColor: barColor(e.status) }]} />
          </View>
          {e.detail && <Text style={[styles.detail, { color: StatusColors[e.status].fg }]}>{e.detail}</Text>}
        </View>
      ))}
    </View>
  );
}

/** Accent "Tip" card. */
export function TipCard({ tip }: { tip: string }) {
  return (
    <View style={styles.tip}>
      <Icon name="bulb" size={22} color={Colors.accInk} />
      <View style={styles.tipText}>
        <Text style={styles.tipLabel}>Tip</Text>
        <Text style={styles.tipBody}>{tip}</Text>
      </View>
    </View>
  );
}

type Dot = { angleDeg: number; seen: boolean };
const SEEN = '#EDEDEA';
const RINGS = { inner: [16, 46], outer: [46, 76] } as const;

/**
 * One cell per dot of the peripheral test: the 24 dots sit every 15°, alternating
 * outer and inner ring, so each dot owns a 30° slice of its ring.
 */
function cell({ angleDeg }: Dot) {
  const slot = Math.round(angleDeg / 15) % 24;
  const [r1, r2] = slot % 2 ? RINGS.inner : RINGS.outer;
  const a1 = ((angleDeg - 15) * Math.PI) / 180;
  const a2 = ((angleDeg + 15) * Math.PI) / 180;
  const pt = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
  return `M${pt(r2, a1)}A${r2} ${r2} 0 0 1 ${pt(r2, a2)}L${pt(r1, a2)}A${r1} ${r1} 0 0 0 ${pt(r1, a1)}Z`;
}

function EyeMap({ label, dots }: { label: string; dots: Dot[] }) {
  const seen = dots.filter((d) => d.seen).length;
  return (
    <View style={styles.map}>
      <Svg width={150} height={150} viewBox="-80 -80 160 160">
        {dots.map((d) => (
          <Path
            key={d.angleDeg}
            d={cell(d)}
            fill={d.seen ? SEEN : Colors.ink}
            stroke={Colors.white}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ))}
        <Circle r={4} fill={Colors.ink} />
      </Svg>
      <Text style={styles.mapLabel}>{label}</Text>
      <Text style={styles.mapCount}>
        {seen} of {dots.length} seen
      </Text>
    </View>
  );
}

/** Screen 58: field map per eye, legend and the "rough screen" note. */
export function FieldMap({ field }: { field: NonNullable<ScoredResult['field']> }) {
  return (
    <>
      <View style={styles.maps}>
        {field.left && <EyeMap label="Left eye" dots={field.left} />}
        {field.right && <EyeMap label="Right eye" dots={field.right} />}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: SEEN }]} />
          <Text style={styles.legendText}>Seen</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: Colors.ink }]} />
          <Text style={styles.legendText}>Missed</Text>
        </View>
      </View>
    </>
  );
}

/** Black-bordered note with an "i", e.g. "Rough screen only…". */
export function NoteCard({ text }: { text: string }) {
  return (
    <View style={styles.note}>
      <View style={styles.noteIcon}>
        <Icon name="infoMark" size={14} color={Colors.white} strokeWidth={2.6} />
      </View>
      <Text style={styles.noteText}>{text}</Text>
    </View>
  );
}

/** While a check loads from the server, or when it couldn't. */
export function LoadState({ failed, onRetry }: { failed: boolean; onRetry: () => void }) {
  return (
    <View style={styles.load}>
      {failed ? (
        <>
          <Text style={styles.loadTitle}>Couldn&apos;t load this check</Text>
          <Text style={styles.loadBody}>Check your internet connection and try again.</Text>
          <Button title="Try again" onPress={onRetry} style={styles.loadButton} />
        </>
      ) : (
        <ActivityIndicator color={Colors.ink} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  load: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loadTitle: { fontFamily: Fonts.bold, fontSize: 22, letterSpacing: -0.4, textAlign: 'center', color: Colors.ink },
  loadBody: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, textAlign: 'center', color: Colors.muted },
  loadButton: { marginTop: 16, alignSelf: 'stretch' },
  barsCard: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  barRow: { paddingVertical: 14, gap: 8 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.divider },
  barTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  barLabel: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.ink },
  barValue: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.ink },
  track: { height: 8, borderRadius: 99, backgroundColor: Colors.border, overflow: 'hidden' },
  trackThin: { height: 6 },
  fill: { height: '100%', borderRadius: 99 },
  detail: { fontFamily: Fonts.semibold, fontSize: 13 },
  cards: { marginTop: 10, flexDirection: 'row', gap: 10 },
  eyeCard: {
    flex: 1,
    padding: 14,
    gap: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  eyeCardLabel: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.muted },
  eyeCardValue: { fontFamily: Fonts.bold, fontSize: 30, lineHeight: 32, letterSpacing: -0.9, color: Colors.ink },
  tip: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 12,
    borderRadius: 20,
    backgroundColor: Colors.accSoft,
  },
  tipText: { flex: 1, gap: 3 },
  tipLabel: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.accInk },
  tipBody: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: Colors.inkSoft },
  maps: { marginTop: 22, flexDirection: 'row', justifyContent: 'space-around', gap: 12 },
  map: { flex: 1, alignItems: 'center', gap: 4 },
  mapLabel: { marginTop: 10, fontFamily: Fonts.bold, fontSize: 16, color: Colors.ink },
  mapCount: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted },
  legend: { marginTop: 16, flexDirection: 'row', justifyContent: 'center', gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 14, height: 14, borderRadius: 4 },
  legendText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.inkSoft },
  note: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ink,
  },
  noteIcon: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: { flex: 1, paddingTop: 3, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: Colors.ink },
});
