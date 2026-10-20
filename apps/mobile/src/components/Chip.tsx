import type { Status } from '@visus/shared';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Sizes, StatusColors, Type } from '@/constants/theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Leading element, e.g. an avatar or icon. */
  leading?: ReactNode;
};

/** Selectable pill, used for answer options and the family list. */
export function Chip({ label, selected, onPress, leading }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        leading ? styles.withLeading : null,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}>
      {leading}
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

/** Small coloured status pill with a dot, e.g. "All clear". */
export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const c = StatusColors[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.badgeLabel, { color: c.fg }]}>{label ?? c.label}</Text>
    </View>
  );
}

/** Grey info pill, e.g. "Right eye" or "Runs on your phone". */
export function Pill({ label, leading }: { label: string; leading?: ReactNode }) {
  return (
    <View style={styles.pill}>
      {leading}
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: Sizes.chip,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  withLeading: { paddingLeft: 6, paddingRight: 16 },
  selected: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  pressed: { opacity: 0.85 },
  label: { ...Type.rowTitle, fontSize: 15, color: Colors.ink },
  selectedLabel: { color: Colors.white },
  badge: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeLabel: { ...Type.label, fontSize: 13 },
  pill: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.pill,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  pillLabel: { ...Type.label, fontSize: 13, color: Colors.inkSoft },
});
