import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Colors, Sizes, Type } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  /** Content of the 38px round icon on the left (an Icon, a letter...). */
  icon?: ReactNode;
  /** Accent-tinted icon circle instead of grey (Tests list numbers, avatars). */
  accent?: boolean;
  /** Right side, before the chevron: short text or a StatusBadge. */
  right?: ReactNode;
  chevron?: boolean;
  /** First row in a card has no top divider. */
  first?: boolean;
  onPress?: () => void;
};

/** A row inside a flush Card. Rows after the first get a divider. */
export function ListRow({ title, subtitle, icon, accent, right, chevron = true, first, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, !first && styles.divider, pressed && styles.pressed]}>
      {icon !== undefined && (
        <View style={[styles.icon, accent && styles.iconAccent]}>
          {typeof icon === 'string' ? (
            <Text style={[styles.iconText, accent && styles.iconTextAccent]}>{icon}</Text>
          ) : (
            icon
          )}
        </View>
      )}
      <View style={styles.text}>
        <Text style={Type.rowTitle} numberOfLines={2}>
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {typeof right === 'string' ? <Text style={styles.subtitle}>{right}</Text> : right}
      {chevron && <Icon name="chevronRight" size={16} color={Colors.faint} strokeWidth={2.2} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: Sizes.rowMin,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  divider: { borderTopWidth: 1, borderTopColor: Colors.divider },
  pressed: { backgroundColor: Colors.cardHover },
  icon: {
    width: Sizes.rowIcon,
    height: Sizes.rowIcon,
    borderRadius: Sizes.rowIcon / 2,
    backgroundColor: Colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAccent: { backgroundColor: Colors.accSoft },
  iconText: { ...Type.h3, color: Colors.ink },
  iconTextAccent: { fontSize: 15, lineHeight: 19, color: Colors.accInk },
  text: { flex: 1, minWidth: 0, gap: 2 },
  subtitle: { ...Type.caption, color: Colors.muted },
});
