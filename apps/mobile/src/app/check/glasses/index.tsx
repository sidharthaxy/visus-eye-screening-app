import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon, type IconName } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { Colors, Fonts } from '@/constants/theme';
import { startCheck } from '@/store/check';

const ROUNDS: [string, string, string, IconName, boolean][] = [
  ['ROUND 1', 'Glasses off', 'Take them off and keep them close by.', 'glassesOff', false],
  ['ROUND 2', 'Glasses on', 'Put them back on when we ask.', 'glasses', true],
];

/** Screen 60: Glasses check setup. Distance acuity twice: without, then with glasses. */
export default function GlassesCheck() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [starting, setStarting] = useState(false);
  const [failed, setFailed] = useState(false);

  async function start() {
    setStarting(true);
    setFailed(false);
    try {
      router.push(await startCheck('glasses', id));
    } catch {
      setFailed(true);
    } finally {
      setStarting(false);
    }
  }

  return (
    <Screen scroll background={Colors.white}>
      <View style={styles.root}>
        <ScreenHeader left="close" onLeft={() => router.back()} title="Glasses check" />
        <Text style={styles.title}>Are your glasses still right?</Text>
        <Text style={styles.sub}>We&apos;ll run a short sharpness test twice and compare.</Text>

        <View style={styles.rounds}>
          {ROUNDS.map(([round, name, body, icon, dark]) => (
            <View key={round} style={styles.round}>
              <View style={[styles.icon, dark && styles.iconDark]}>
                <Icon name={icon} size={24} color={dark ? Colors.white : Colors.ink} strokeWidth={1.7} />
              </View>
              <View style={styles.text}>
                <Text style={styles.kicker}>{round}</Text>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.body}>{body}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.hint}>
          <Icon name="clock" size={20} color={Colors.inkSoft} strokeWidth={1.9} />
          <Text style={styles.hintText}>About 3 minutes · one eye at a time</Text>
        </View>
        {failed && <Text style={styles.error}>Couldn&apos;t start. Check your internet connection and try again.</Text>}

        <View style={styles.spacer} />
        <Button title={starting ? 'Starting…' : 'Start'} disabled={starting} onPress={() => void start()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: { marginTop: 22, fontFamily: Fonts.bold, fontSize: 30, lineHeight: 35, letterSpacing: -0.75, color: Colors.ink },
  sub: { marginTop: 8, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: Colors.muted },
  rounds: { marginTop: 24, gap: 12 },
  round: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  icon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F4F4F1', alignItems: 'center', justifyContent: 'center' },
  iconDark: { backgroundColor: Colors.ink },
  text: { flex: 1, minWidth: 0, gap: 2 },
  kicker: { fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 0.72, color: '#8A8A85' },
  name: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.ink },
  body: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: Colors.muted },
  hint: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  hintText: { flex: 1, fontFamily: Fonts.regular, fontSize: 15, color: Colors.inkSoft },
  error: { marginTop: 12, fontFamily: Fonts.regular, fontSize: 14, color: '#A3342A' },
  spacer: { flex: 1, minHeight: 16 },
});
