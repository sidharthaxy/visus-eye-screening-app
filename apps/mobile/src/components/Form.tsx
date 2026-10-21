// Form pieces from the profile screens: switch, switch card, age stepper, field label.
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { Colors, Fonts, Radius } from '@/constants/theme';

/** 51 × 31 switch, accent when on. */
export function Switch({ value, onChange, label }: { value: boolean; onChange: (on: boolean) => void; label: string }) {
  const [x] = useState(() => new Animated.Value(value ? 20 : 0));
  useEffect(() => {
    Animated.timing(x, { toValue: value ? 20 : 0, duration: 180, useNativeDriver: true }).start();
  }, [value, x]);
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      hitSlop={8}
      style={[styles.track, { backgroundColor: value ? Colors.acc : '#E1E1DC' }]}>
      <Animated.View style={[styles.knob, { transform: [{ translateX: x }] }]} />
    </Pressable>
  );
}

/** White card with a title, a grey line and a switch ("This is a child"). */
export function SwitchRow({ title, sub, value, onChange }: { title: string; sub: string; value: boolean; onChange: (on: boolean) => void }) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchText}>
        <Text style={styles.switchTitle}>{title}</Text>
        <Text style={styles.switchSub}>{sub}</Text>
      </View>
      <Switch value={value} onChange={onChange} label={title} />
    </View>
  );
}

/** "Name", "Age", "Relation" above a field. */
export function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

/** "34 years" with − and + buttons. */
export function AgeStepper({ age, onChange, min = 1, max = 110 }: { age: number; onChange: (age: number) => void; min?: number; max?: number }) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.age}>{age} years</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease age"
        onPress={() => onChange(Math.max(min, age - 1))}
        style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}>
        <Icon name="minus" size={18} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase age"
        onPress={() => onChange(Math.min(max, age + 1))}
        style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}>
        <Icon name="plusBold" size={18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: 51, height: 31, padding: 2, borderRadius: Radius.pill },
  knob: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  switchRow: {
    minHeight: 72,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  switchText: { flex: 1, gap: 2 },
  switchTitle: { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.ink },
  switchSub: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: Colors.muted },
  field: { gap: 8 },
  label: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.inkSoft },
  stepper: {
    minHeight: 56,
    paddingLeft: 16,
    paddingRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.card,
  },
  age: { flex: 1, fontFamily: Fonts.semibold, fontSize: 16, color: Colors.ink, fontVariant: ['tabular-nums'] },
  stepButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.fill, alignItems: 'center', justifyContent: 'center' },
  pressed: { transform: [{ scale: 0.94 }] },
});
