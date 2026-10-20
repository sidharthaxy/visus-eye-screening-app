import type { Status } from '@visus/shared';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Sizes, StatusColors, Type } from '@/constants/theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Leading avatar or icon. Switches to the compact family-chip style. */
  leading?: ReactNode;
};

/** Selectable pill: answer options (onboarding) and, with `leading`, family members. */
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
      <Text style={[leading ? styles.memberLabel : styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

/** Round initial for family chips. */
export function ChipAvatar({ initial, selected }: { initial: string; selected?: boolean }) {
  return (
    <View style={[styles.avatar, selected && styles.avatarSelected]}>
      <Text style={[styles.avatarText, selected && styles.selectedLabel]}>{initial}</Text>
    </View>
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

/** Grey info pill. `sm` (30px): "Right eye", "1 minute". `md` (34px): Entry "Tests run on your phone". */
export function Pill({ label, leading, size = 'sm' }: { label: string; leading?: ReactNode; size?: 'sm' | 'md' }) {
  return (
    <View style={[styles.pill, size === 'md' && styles.pillMd]}>
      {leading}
      <Text style={[styles.pillLabel, size === 'md' && styles.pillLabelMd]}>{label}</Text>
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
    borderColor: Colors.borderOption,
    backgroundColor: Colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  withLeading: { height: Sizes.chip, paddingVertical: 0, paddingLeft: 6, paddingRight: 16 },
  selected: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  pressed: { opacity: 0.85 },
  label: { ...Type.option, color: Colors.ink },
  memberLabel: { ...Type.rowTitle, fontSize: 15, color: Colors.ink },
  selectedLabel: { color: Colors.white },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: { backgroundColor: 'rgba(255,255,255,0.16)' },
  avatarText: { fontFamily: Type.h3.fontFamily, fontSize: 13, color: Colors.ink },
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
  pillMd: { height: 34, paddingHorizontal: 14, gap: 8 },
  pillLabel: { ...Type.label, fontSize: 13, color: Colors.inkSoft },
  pillLabelMd: { fontSize: 14 },
});
