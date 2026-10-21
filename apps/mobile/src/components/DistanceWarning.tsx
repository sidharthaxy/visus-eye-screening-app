// Screen 47: Distance warning. Covers the test while the phone is too close or too far,
// with the live distance; Resume once it's back in range.
import { Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { DistancePanel, distanceState } from '@/components/DistancePanel';
import { Icon } from '@/components/Icon';
import { TestHeader } from '@/components/TestHeader';
import { Text } from '@/components/Text';
import { Colors, Fonts, Spacing } from '@/constants/theme';

type Props = { visible: boolean; title: string; cm: number | null; target: number; onResume: () => void; onExit: () => void };

export function DistanceWarning({ visible, title, cm, target, onResume, onExit }: Props) {
  const insets = useSafeAreaInsets();
  const ok = distanceState(cm, target) === 'ok';
  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onExit}>
      <View style={[styles.root, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + 16 }]}>
        <TestHeader title={title} onExit={onExit} progress="Paused" />
        <DistancePanel cm={cm} target={target} />
        <View style={styles.spacer} />
        <View style={styles.note}>
          <Icon name={ok ? 'check' : 'pause'} size={16} color={Colors.muted} strokeWidth={2} />
          <Text style={styles.noteText}>{ok ? 'Distance is right. You can carry on.' : `The test waits until you're ${target - 5}–${target + 5} cm away.`}</Text>
        </View>
        <Button title={ok ? 'Resume test' : 'Waiting for the right distance'} disabled={!ok} onPress={onResume} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: Spacing.xl, backgroundColor: Colors.bg },
  spacer: { flex: 1, minHeight: 12 },
  note: { marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  noteText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted, textAlign: 'center', flexShrink: 1 },
});
