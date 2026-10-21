import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { Colors, Fonts, StatusColors } from '@/constants/theme';
import { useSettings } from '@/store/settings';
import { newCheckRoute } from '@/store/check';
import { UNAVAILABLE_NOTE, type ReminderResult } from '@/services/reminders';

/**
 * Screen 41: Permissions, once after onboarding. Notifications only for now:
 * the Camera card comes with face-distance tracking (Phase 3).
 */
export default function Permissions() {
  const reminderOn = useSettings((s) => s.reminders.check);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ReminderResult | null>(null);

  async function allow() {
    setBusy(true);
    try {
      const outcome = await (await import('@/services/reminders')).enableCheckReminder();
      useSettings.getState().setReminder('check', outcome === 'on');
      setResult(outcome);
    } catch {
      setResult('unavailable');
    } finally {
      setBusy(false);
    }
  }

  async function next() {
    try {
      router.replace(await newCheckRoute());
    } catch {
      router.replace('/home');
    }
  }

  return (
    <Screen scroll>
      <View style={styles.root}>
        <ScreenHeader left="back" onLeft={() => void next()} leftLabel="Skip" title="Permissions" />
        <Text style={styles.title}>One quick permission</Text>
        <Text style={styles.sub}>Visus works without it, but reminders work best with it on.</Text>

        <View style={styles.card}>
          <View style={styles.top}>
            <View style={styles.icon}>
              <Icon name="bell" size={22} color={Colors.accInk} strokeWidth={1.9} />
            </View>
            <View style={styles.text}>
              <Text style={styles.name}>Notifications</Text>
              <Text style={styles.body}>A monthly nudge when it&apos;s time to re-check your eyes.</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={reminderOn || busy}
            onPress={() => void allow()}
            style={[styles.allow, reminderOn && styles.allowed]}>
            {reminderOn && <Icon name="checkLarge" size={18} color={StatusColors.good.fg} strokeWidth={2.4} />}
            <Text style={[styles.allowText, reminderOn && styles.allowedText]}>{reminderOn ? 'Allowed' : busy ? 'Asking…' : 'Allow'}</Text>
          </Pressable>
        </View>
        {result === 'denied' && (
          <Pressable accessibilityRole="button" onPress={() => void Linking.openSettings()}>
            <Text style={styles.refused}>Notifications are off for Visus. Tap to open your phone settings.</Text>
          </Pressable>
        )}
        {result === 'unavailable' && <Text style={styles.refused}>{UNAVAILABLE_NOTE}</Text>}

        <View style={styles.spacer} />
        <View style={styles.note}>
          <Icon name="shieldCheck" size={16} color={Colors.muted} />
          <Text style={styles.noteText}>Change this anytime in Settings.</Text>
        </View>
        {reminderOn ? (
          <Button title="Continue" onPress={() => void next()} />
        ) : (
          <Button title="Not now" variant="ghost" onPress={() => void next()} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: { marginTop: 20, fontFamily: Fonts.bold, fontSize: 28, lineHeight: 32, letterSpacing: -0.7, color: Colors.ink },
  sub: { marginTop: 6, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: Colors.muted },
  card: { marginTop: 22, padding: 16, gap: 14, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accSoft, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, minWidth: 0, gap: 4 },
  name: { fontFamily: Fonts.bold, fontSize: 17, color: Colors.ink },
  body: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: Colors.muted },
  allow: { minHeight: 48, borderRadius: 14, backgroundColor: Colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  allowed: { backgroundColor: StatusColors.good.bg },
  allowText: { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.white },
  allowedText: { color: StatusColors.good.fg },
  refused: { marginTop: 10, marginHorizontal: 4, fontFamily: Fonts.semibold, fontSize: 13, lineHeight: 18, color: StatusColors.see_doctor.fg },
  spacer: { flex: 1, minHeight: 16 },
  note: { marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  noteText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted },
});
