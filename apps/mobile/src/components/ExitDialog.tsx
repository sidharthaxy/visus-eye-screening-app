// Screen 46: Exit confirmation, over any check screen (X or Android back).
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { Colors, Fonts, Radius, Sizes, StatusColors } from '@/constants/theme';
import { useCheck } from '@/store/check';

/** Ends the check in progress and goes back to Home. */
export function leaveCheck() {
  Speech.stop();
  useCheck.getState().reset();
  router.dismissTo('/home');
}

/**
 * The exit dialog for a check screen. `ask()` opens it; Android back opens it too.
 * Render `dialog` anywhere in the screen.
 */
export function useLeaveCheck() {
  const [open, setOpen] = useState(false);
  const finished = useCheck((s) => s.results.length);
  const total = useCheck((s) => s.plan.length);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setOpen(true);
      return true;
    });
    return () => sub.remove();
  }, []);

  const dialog = (
    <ExitDialog visible={open} finished={finished} total={total} onStay={() => setOpen(false)} onLeave={leaveCheck} />
  );
  return { ask: () => setOpen(true), dialog };
}

type Props = { visible: boolean; finished: number; total: number; onStay: () => void; onLeave: () => void };

export function ExitDialog({ visible, finished, total, onStay, onLeave }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onStay}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityRole="alert" accessibilityLabel="Leave the check?">
          <View style={styles.icon}>
            <Icon name="exit" size={24} color={StatusColors.mild.fg} />
          </View>
          <Text style={styles.title}>Leave the check?</Text>
          <Text style={styles.body}>Results from finished tests are saved.</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>
              {finished} of {total} {total === 1 ? 'test' : 'tests'} finished
            </Text>
          </View>
          <View style={styles.buttons}>
            <Pressable
              accessibilityRole="button"
              onPress={onLeave}
              style={({ pressed }) => [styles.leave, pressed && styles.pressed]}>
              <Text style={styles.leaveText}>Leave</Text>
            </Pressable>
            <Button title="Stay" onPress={onStay} style={styles.stay} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(17,17,17,0.42)', justifyContent: 'center', paddingHorizontal: 24 },
  card: {
    borderRadius: 28,
    backgroundColor: Colors.white,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 20 },
    elevation: 12,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: StatusColors.mild.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 16, fontFamily: Fonts.bold, fontSize: 22, letterSpacing: -0.33, color: Colors.ink },
  body: { marginTop: 8, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: Colors.muted, textAlign: 'center' },
  pill: { marginTop: 14, height: 28, paddingHorizontal: 12, borderRadius: Radius.pill, backgroundColor: Colors.fill, justifyContent: 'center' },
  pillText: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.inkSoft },
  buttons: { alignSelf: 'stretch', marginTop: 22, flexDirection: 'row', gap: 10 },
  leave: {
    flex: 1,
    height: Sizes.button,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveText: { fontFamily: Fonts.semibold, fontSize: 17, color: StatusColors.see_doctor.fg },
  stay: { flex: 1 },
  pressed: { transform: [{ scale: 0.98 }] },
});
