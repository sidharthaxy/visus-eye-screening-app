import { StyleSheet, Text, View } from 'react-native';

import { Pill } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Colors, Type } from '@/constants/theme';

type Props = {
  title: string;
  onExit: () => void;
  /** e.g. "Right eye" or "Both eyes". */
  eyeLabel?: string;
  /** Right of the eye pill, e.g. "Line 4 · 20/40", "Hold at 40 cm", "Plate 3 of 12". */
  progress?: string;
};

/** Top of every visual test screen: exit, title, then eye pill + progress. */
export function TestHeader({ title, onExit, eyeLabel, progress }: Props) {
  return (
    <View>
      <ScreenHeader left="close" leftLabel="Exit test" onLeft={onExit} title={title} />
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
  meta: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  progress: { ...Type.label, color: Colors.muted },
});
