import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { Colors, Radius, Sizes, Type } from '@/constants/theme';
import { useSizes } from '@/store/settings';

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverted';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  /** Shows the arrow after the label, as on "Start eye check". */
  arrow?: boolean;
  /** Icon before the label, e.g. the pin on "Find eye doctors nearby". */
  icon?: IconName;
  iconColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const VARIANTS: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: Colors.ink, fg: Colors.white },
  secondary: { bg: Colors.card, fg: Colors.ink, border: Colors.borderStrong },
  ghost: { bg: 'transparent', fg: Colors.muted },
  inverted: { bg: Colors.white, fg: Colors.ink },
};

export function Button({ title, onPress, variant = 'primary', arrow, icon, iconColor, disabled, style }: Props) {
  const v = VARIANTS[variant];
  const sizes = useSizes();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { height: sizes.button },
        variant === 'ghost' && styles.ghost,
        { backgroundColor: v.bg },
        v.border && { borderWidth: 1, borderColor: v.border },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <View style={styles.content}>
        {icon && <Icon name={icon} size={20} color={iconColor ?? v.fg} />}
        <Text style={[variant === 'ghost' ? styles.ghostLabel : Type.button, { color: v.fg }]}>{title}</Text>
        {arrow && <Icon name="arrowRight" size={20} color={v.fg} strokeWidth={2.2} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: Sizes.button,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  ghost: { height: 44 },
  ghostLabel: { ...Type.button, fontSize: 16 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pressed: { transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.35 },
});
