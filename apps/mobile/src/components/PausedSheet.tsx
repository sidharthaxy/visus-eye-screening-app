// Screen 45: Test paused. Bottom sheet over the test when the app comes back from the background.
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { Colors, Fonts, StatusColors } from '@/constants/theme';

type Props = {
  visible: boolean;
  /** e.g. "Distance acuity · Right eye". */
  detail: string;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
};

export function PausedSheet({ visible, detail, onResume, onRestart, onExit }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onResume}>
      <View style={styles.scrim}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 34 }]}>
          <View style={styles.handle} />
          <View style={styles.top}>
            <View style={styles.icon}>
              <Icon name="pause" size={22} />
            </View>
            <View style={styles.text}>
              <Text style={styles.title}>Test paused</Text>
              <Text style={styles.detail}>{detail}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Button title="Resume" icon="play" onPress={onResume} />
            <Button title="Restart test" variant="secondary" icon="restart" onPress={onRestart} />
            <Pressable accessibilityRole="button" onPress={onExit} style={({ pressed }) => [styles.exit, pressed && styles.pressed]}>
              <Icon name="exit" size={20} color={StatusColors.see_doctor.fg} />
              <Text style={styles.exitText}>Exit check</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17,17,17,0.42)' },
  sheet: {
    paddingTop: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -10 },
    elevation: 12,
  },
  handle: { alignSelf: 'center', width: 36, height: 5, borderRadius: 99, backgroundColor: Colors.borderStrong },
  top: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.fill, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontFamily: Fonts.bold, fontSize: 22, letterSpacing: -0.3, color: Colors.ink },
  detail: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted },
  actions: { marginTop: 22, gap: 10 },
  exit: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  pressed: { opacity: 0.7 },
  exitText: { fontFamily: Fonts.semibold, fontSize: 17, color: StatusColors.see_doctor.fg },
});
