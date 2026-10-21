import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { Colors, Fonts, Radius, StatusColors } from '@/constants/theme';
import { canDrawOverlays, onAppActive, openOverlaySettings, setBreakReminders } from '@/services/coach';
import { useSizes } from '@/store/settings';

const POINTS = ['Only appears during a break', "Can't see or read what's on screen", 'Turn it off anytime in Settings'];

/** Screen 21: Coach permission. "Display over other apps", so the break reminder can show on top. */
export default function CoachPermission() {
  const sizes = useSizes();
  const [granted, setGranted] = useState(canDrawOverlays);

  // Back from Android Settings: if allowed, turn break reminders on.
  useEffect(
    () =>
      onAppActive(() => {
        if (!canDrawOverlays()) return;
        setGranted(true);
        setBreakReminders(true);
      }),
    [],
  );

  function grant() {
    if (granted) return router.back();
    openOverlaySettings();
  }

  return (
    <Screen>
      <View style={styles.root}>
        <ScreenHeader left="back" onLeft={() => router.back()} title="Screen Coach" />

        <View style={styles.art}>
          <View style={styles.phone}>
            <View style={[styles.line, { width: '60%', height: 10 }]} />
            <View style={styles.block} />
            <View style={[styles.line, { width: '80%' }]} />
            <View style={[styles.line, { width: '50%' }]} />
            <View style={styles.toast}>
              <View style={styles.toastIcon}>
                <Icon name="eye" size={16} color={Colors.white} strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.toastTitle}>Time for a break</Text>
                <Text style={styles.toastSub}>Look away for 20 sec</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Let Visus remind you to rest</Text>
        <Text style={styles.sub}>To show a break reminder while you use other apps, Visus needs permission to appear on top of them.</Text>

        <View style={styles.points}>
          {POINTS.map((p) => (
            <View key={p} style={styles.point}>
              <View style={styles.check}>
                <Icon name="check" size={14} color={Colors.accInk} strokeWidth={2.6} />
              </View>
              <Text style={styles.pointText}>{p}</Text>
            </View>
          ))}
        </View>

        <View style={styles.spacer} />
        <Pressable
          accessibilityRole="button"
          onPress={grant}
          style={[styles.button, { height: sizes.button, backgroundColor: granted ? StatusColors.good.bg : Colors.ink }]}>
          {granted && <Icon name="check" size={18} color={StatusColors.good.fg} strokeWidth={2.4} />}
          <Text style={[styles.buttonText, { color: granted ? StatusColors.good.fg : Colors.white }]}>
            {granted ? 'Permission granted' : 'Grant permission'}
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.later}>
          <Text style={styles.laterText}>{granted ? 'Done' : 'Not now'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  art: { marginTop: 18, height: 232, borderRadius: Radius.hero, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, alignItems: 'center', overflow: 'hidden' },
  phone: {
    marginTop: 40,
    width: 132,
    height: 196,
    paddingTop: 14,
    paddingHorizontal: 10,
    gap: 8,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: Colors.ink,
    backgroundColor: Colors.bg,
  },
  line: { height: 8, borderRadius: 4, backgroundColor: Colors.borderOption },
  block: { height: 44, borderRadius: 8, backgroundColor: Colors.border },
  toast: {
    position: 'absolute',
    left: -26,
    right: -26,
    top: 58,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: Colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 8,
  },
  toastIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  toastTitle: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.white },
  toastSub: { fontFamily: Fonts.regular, fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  title: { marginTop: 24, fontFamily: Fonts.bold, fontSize: 28, lineHeight: 32, letterSpacing: -0.7, color: Colors.ink },
  sub: { marginTop: 8, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: Colors.muted },
  points: { marginTop: 18, gap: 12 },
  point: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.accSoft, alignItems: 'center', justifyContent: 'center' },
  pointText: { flex: 1, fontFamily: Fonts.regular, fontSize: 16, color: Colors.inkSoft },
  spacer: { flex: 1, minHeight: 16 },
  button: { borderRadius: Radius.button, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { fontFamily: Fonts.semibold, fontSize: 17 },
  later: { marginTop: 4, height: 44, alignItems: 'center', justifyContent: 'center' },
  laterText: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.muted },
});
