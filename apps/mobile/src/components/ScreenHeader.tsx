import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { Colors, Sizes, Type } from '@/constants/theme';

type Props = {
  title?: string;
  /** Grey round button on the left: back chevron or close cross. */
  left: 'back' | 'close';
  onLeft: () => void;
  leftLabel?: string;
  /** Smaller grey title, used for a category ("Clarity") above a big heading. */
  small?: boolean;
  /** Right side: short text ("1 of 5") or a round button (see HeaderButton). */
  right?: ReactNode;
};

/** The 44 · title · 44 bar at the top of every non-tab screen. */
export function ScreenHeader({ title, left, onLeft, leftLabel, small, right }: Props) {
  return (
    <View style={styles.bar}>
      <HeaderButton
        icon={left === 'back' ? 'chevronLeft' : 'close'}
        label={leftLabel ?? (left === 'back' ? 'Back' : 'Close')}
        onPress={onLeft}
      />
      <Text style={small ? styles.small : styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side}>
        {typeof right === 'string' ? <Text style={styles.rightText}>{right}</Text> : right}
      </View>
    </View>
  );
}

type ButtonProps = { icon: 'chevronLeft' | 'close' | 'share'; label: string; onPress: () => void };

/** 44px grey round icon button. */
export function HeaderButton({ icon, label, onPress }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Icon name={icon} size={icon === 'chevronLeft' ? 20 : 18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { height: Sizes.iconButton, flexDirection: 'row', alignItems: 'center' },
  button: {
    width: Sizes.iconButton,
    height: Sizes.iconButton,
    borderRadius: Sizes.iconButton / 2,
    backgroundColor: Colors.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.94 }] },
  title: { ...Type.headerTitle, flex: 1, textAlign: 'center', color: Colors.ink },
  small: { ...Type.rowTitle, fontSize: 15, flex: 1, textAlign: 'center', color: Colors.muted },
  side: { width: Sizes.iconButton, alignItems: 'flex-end' },
  rightText: { ...Type.label, fontSize: 13, color: Colors.muted },
});
