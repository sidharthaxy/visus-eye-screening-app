// Pieces shared by the test screens (26–32): the white test card, the
// question heading, and the summary line + two buttons at the bottom.
import type { Eye } from '@visus/shared';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { Colors, Fonts, Radius, Sizes } from '@/constants/theme';
import { useCalibration } from '@/store/calibration';

/** Raw answers of one test for one eye (or both eyes together). The server scores them. */
export type Answers = Record<string, unknown>;

export type TestProps = {
  eye: Eye;
  /** Exit button in the header. */
  onExit: () => void;
  onDone: (answers: Answers) => void;
};

export const EYE_LABEL: Record<Eye, string> = { right: 'Right eye', left: 'Left eye', both: 'Both eyes' };
export const COVER: Record<Eye, string | undefined> = { right: 'Cover left eye', left: 'Cover right eye', both: undefined };

/** Viewing distance the instructions ask for (arm's length). */
export const DISTANCE_CM = 40;

/** Fallback when the screen isn't calibrated: a typical 160 dpi. */
const DEFAULT_PX_PER_MM = 160 / 25.4;

/** Screen points per mm, and whether it came from calibration. Sent with answers that depend on size. */
export function usePxPerMm() {
  const calibrated = useCalibration((s) => s.pxPerMm);
  return { pxPerMm: calibrated ?? DEFAULT_PX_PER_MM, calibrated: calibrated !== null };
}

/** White card the test is drawn on. Grows to fill the space. */
export function TestCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function TestQuestion({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.question}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

type FooterProps = {
  summary: string;
  /** Left button, e.g. "All look the same". Black when on. */
  toggleLabel: string;
  toggled: boolean;
  onToggle: () => void;
  doneLabel: string;
  canFinish: boolean;
  onDone: () => void;
};

/** Summary line, then the "nothing to mark" toggle and the finish button. */
export function TestFooter({ summary, toggleLabel, toggled, onToggle, doneLabel, canFinish, onDone }: FooterProps) {
  return (
    <View>
      <Text style={styles.summary}>{summary}</Text>
      <View style={styles.buttons}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: toggled }}
          onPress={onToggle}
          style={({ pressed }) => [styles.toggle, toggled && styles.toggleOn, pressed && styles.pressed]}>
          <Text style={[styles.toggleText, toggled && styles.toggleTextOn]}>{toggleLabel}</Text>
        </Pressable>
        <Button title={doneLabel} onPress={onDone} disabled={!canFinish} style={styles.done} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 0,
    marginTop: 14,
    borderRadius: Radius.hero,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: { marginTop: 18, gap: 6 },
  title: { fontFamily: Fonts.bold, fontSize: 26, lineHeight: 31, letterSpacing: -0.65, color: Colors.ink },
  subtitle: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: Colors.muted },
  summary: { marginTop: 12, textAlign: 'center', fontFamily: Fonts.semibold, fontSize: 14, color: Colors.inkSoft },
  buttons: { marginTop: 12, flexDirection: 'row', gap: 10 },
  toggle: {
    flex: 1,
    minHeight: Sizes.button,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  toggleText: { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.ink },
  toggleTextOn: { color: Colors.white },
  pressed: { transform: [{ scale: 0.98 }] },
  done: { flex: 1 },
});
