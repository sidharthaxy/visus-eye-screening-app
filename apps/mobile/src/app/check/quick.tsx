import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Pill } from '@/components/Chip';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { startCheck } from '@/store/check';

/** The small E from the design (5 × 5 grid). */
const SmallE = () => (
  <Svg width={22} height={22} viewBox="0 0 5 5">
    <Path d="M0 0h5v1H0zM0 2h5v1H0zM0 4h5v1H0zM0 0h1v5H0z" fill={Colors.ink} />
  </Svg>
);

const ROWS: [ReactNode, string, string][] = [
  [<SmallE key="e" />, 'Tumbling E', 'Sharpness'],
  [<Icon key="g" name="grid" size={28} strokeWidth={1.4} />, 'Amsler grid', 'Central vision'],
  [<Icon key="d" name="dial" size={26} />, 'Clock dial', 'Astigmatism'],
];

/** Screen 59: Quick check intro. Three short tests (the E chart runs a shorter version). */
export default function QuickCheck() {
  const [starting, setStarting] = useState(false);
  const [failed, setFailed] = useState(false);

  async function start() {
    setStarting(true);
    setFailed(false);
    try {
      router.push(await startCheck('quick'));
    } catch {
      setFailed(true);
    } finally {
      setStarting(false);
    }
  }

  return (
    <Screen scroll background={Colors.white}>
      <View style={styles.root}>
        <ScreenHeader left="close" onLeft={() => router.back()} title="Quick check" />

        <View style={styles.pill}>
          <Pill label="1 minute" leading={<Icon name="clock" size={14} color={Colors.inkSoft} strokeWidth={2.2} />} />
        </View>
        <Text style={styles.title}>1-minute check</Text>
        <Text style={styles.sub}>Three fast tests for a quick read on your eyes.</Text>

        <View style={styles.list}>
          {ROWS.map(([icon, name, what]) => (
            <View key={name} style={styles.row}>
              <View style={styles.icon}>{icon}</View>
              <View style={styles.text}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.what}>{what}</Text>
              </View>
              <Text style={styles.time}>20 sec</Text>
            </View>
          ))}
        </View>

        <View style={styles.hint}>
          <Icon name="glasses" size={20} color={Colors.inkSoft} strokeWidth={1.9} />
          <Text style={styles.hintText}>Keep your glasses on. Hold the phone about 40 cm away.</Text>
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
  pill: { marginTop: 22, alignItems: 'flex-start' },
  title: { marginTop: 12, fontFamily: Fonts.bold, fontSize: 30, lineHeight: 35, letterSpacing: -0.75, color: Colors.ink },
  sub: { marginTop: 8, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: Colors.muted },
  list: { marginTop: 24, borderBottomWidth: 1, borderBottomColor: Colors.border },
  row: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  icon: {
    width: 56,
    height: 56,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontFamily: Fonts.bold, fontSize: 17, color: Colors.ink },
  what: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted },
  time: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.muted },
  hint: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  hintText: { flex: 1, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 21, color: Colors.inkSoft },
  error: { marginTop: 12, fontFamily: Fonts.regular, fontSize: 14, color: '#A3342A' },
  spacer: { flex: 1, minHeight: 16 },
});
