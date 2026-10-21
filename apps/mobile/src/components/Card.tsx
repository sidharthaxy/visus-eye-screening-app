import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

type Props = {
  children: ReactNode;
  /** Dark hero card, as on Home "Time for your eye check". */
  dark?: boolean;
  /** No inner padding, for cards that hold ListRows. */
  flush?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, dark, flush, onPress, style }: Props) {
  const cardStyle = [styles.card, dark && styles.dark, flush && styles.flush, style];
  if (!onPress) return <View style={cardStyle}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    padding: 16,
  },
  dark: {
    backgroundColor: Colors.hero,
    borderWidth: 0,
    borderRadius: Radius.hero,
    padding: 20,
  },
  flush: { padding: 0, overflow: 'hidden' },
  pressed: { transform: [{ scale: 0.98 }], borderColor: '#D6D6D1' },
});
