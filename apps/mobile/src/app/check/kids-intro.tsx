import type { Profile } from '@visus/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { listProfiles } from '@/services/profiles';
import { startCheck } from '@/store/check';

const STEPS = [
  'Sit next to your child, at the same eye level.',
  'Hold the phone 40 cm from their face, about the length of your forearm.',
  'Let them point or say the answer. You tap it for them.',
];

/** Screen 43: Kids mode intro, before a child's check. */
export default function KidsIntro() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [child, setChild] = useState<Profile | null>(null);
  const [starting, setStarting] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    listProfiles().then((all) => live && setChild(all.find((p) => p.id === id) ?? null));
    return () => {
      live = false;
    };
  }, [id]);

  async function start() {
    setStarting(true);
    setFailed(false);
    try {
      router.push(await startCheck('full', id));
    } catch {
      setFailed(true);
    } finally {
      setStarting(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.root}>
        <ScreenHeader left="back" onLeft={() => router.back()} title="Kids mode" />

        {/* Parent beside child, phone at arm's length. */}
        <View style={styles.art}>
          <Icon name="parent" size={92} strokeWidth={1.3} />
          <View style={styles.distance}>
            <Icon name="armsLength" size={22} color={Colors.muted} />
            <Text style={styles.distanceText}>40 cm</Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>For parents{child ? ` · ${child.name.split(' ')[0]}, ${child.age}` : ''}</Text>
        <Text style={styles.title}>Do this one together</Text>

        <View style={styles.steps}>
          {STEPS.map((step, i) => (
            <View key={step} style={styles.step}>
              <View style={styles.number}>
                <Text style={styles.numberText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tip}>
          <Icon name="bulb" size={22} color={Colors.accInk} />
          <Text style={styles.tipText}>Try not to hint. If they get tired, pause and come back later.</Text>
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
  art: { marginTop: 16, height: 180, borderRadius: Radius.hero, backgroundColor: Colors.fill, alignItems: 'center', justifyContent: 'center', gap: 10 },
  distance: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  distanceText: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.muted },
  eyebrow: { marginTop: 20, fontFamily: Fonts.semibold, fontSize: 14, color: Colors.muted },
  title: { marginTop: 4, fontFamily: Fonts.bold, fontSize: 28, lineHeight: 32, letterSpacing: -0.7, color: Colors.ink },
  steps: { marginTop: 18, gap: 12 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  number: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.accSoft, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.accInk },
  stepText: { flex: 1, paddingTop: 3, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 23, color: Colors.ink },
  tip: { marginTop: 16, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 12, borderRadius: 20, backgroundColor: Colors.accSoft },
  tipText: { flex: 1, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: Colors.inkSoft },
  error: { marginTop: 12, fontFamily: Fonts.regular, fontSize: 14, color: '#A3342A' },
  spacer: { flex: 1, minHeight: 16 },
});
