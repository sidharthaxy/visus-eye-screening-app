import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { Colors, Radius, Type } from '@/constants/theme';
import { useSizes } from '@/store/settings';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

/** Single-choice answer card with a radio on the right (onboarding, Who is this for, ...). */
export function OptionRow({ label, selected, onPress }: Props) {
  const sizes = useSizes();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.row, { minHeight: sizes.option }, selected && styles.selected]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected && <Icon name="check" size={12} color={Colors.white} strokeWidth={2.4} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.borderOption,
    backgroundColor: Colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  // The design adds a 1px inset ring when selected: a 2px border without shifting the content.
  selected: { borderWidth: 2, borderColor: Colors.ink, paddingVertical: 11, paddingHorizontal: 17 },
  label: { ...Type.option, flex: 1, color: Colors.ink },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CFCFCA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: Colors.ink, backgroundColor: Colors.ink },
});
