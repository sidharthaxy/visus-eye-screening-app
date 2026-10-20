import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Pill } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { Colors, Sizes, Type } from '@/constants/theme';

type Props = {
  title: string;
  onExit: () => void;
  /** e.g. "Right eye". Shown as a pill under the title row. */
  eyeLabel?: string;
  /** e.g. "Line 4 · 20/40" or "2 of 4". */
  progress?: string;
};

/** Top of every test screen: exit button, centred title, eye + progress. */
export function TestHeader({ title, onExit, eyeLabel, progress }: Props) {
  return (
    <View>
      <View style={styles.bar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exit test"
          onPress={onExit}
          hitSlop={8}
          style={({ pressed }) => [styles.exit, pressed && styles.pressed]}>
          <Icon name="close" size={18} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.side} />
      </View>
      {(eyeLabel || progress) && (
        <View style={styles.meta}>
          {eyeLabel ? <Pill label={eyeLabel} leading={<Icon name="eye" size={16} color={Colors.inkSoft} />} /> : <View />}
          {progress && <Text style={styles.progress}>{progress}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { height: Sizes.iconButton, flexDirection: 'row', alignItems: 'center' },
  exit: {
    width: Sizes.iconButton,
    height: Sizes.iconButton,
    borderRadius: Sizes.iconButton / 2,
    backgroundColor: Colors.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.94 }] },
  title: { ...Type.headerTitle, flex: 1, textAlign: 'center', color: Colors.ink },
  side: { width: Sizes.iconButton },
  meta: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  progress: { ...Type.label, color: Colors.muted },
});
