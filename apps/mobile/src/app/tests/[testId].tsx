import { TestId } from '@visus/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TestArt } from '@/components/TestArt';
import { CATEGORIES, TEST_COPY, testInfo } from '@/constants/tests';
import { Colors, Fonts, Radius, Type } from '@/constants/theme';
import { getMyProfile } from '@/services/profiles';
import { createSession } from '@/services/sessions';
import { firstStep, useCheck } from '@/store/check';

/** Screen 8: Test detail. */
export default function TestDetail() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  const parsed = TestId.safeParse(testId);
  const startCheck = useCheck((s) => s.start);
  const [starting, setStarting] = useState(false);
  const test = parsed.success ? testInfo(parsed.data) : undefined;

  if (!test) {
    return (
      <Screen>
        <ScreenHeader left="back" onLeft={() => router.back()} title="Test" />
        <Text style={styles.body}>This test doesn&apos;t exist.</Text>
      </Screen>
    );
  }

  const copy = TEST_COPY[test.id];

  /** A single test is its own session (mode "single"), then the usual calibration → instructions. */
  async function start() {
    if (!test || starting) return;
    setStarting(true);
    try {
      const profile = await getMyProfile();
      const session = await createSession({ profileId: profile.id, intake: '', mode: 'single', testId: test.id });
      startCheck('single', session);
      router.push(firstStep());
    } finally {
      setStarting(false);
    }
  }
  const category = CATEGORIES.find((c) => c.id === test.category)!;
  const facts: [string, string][] = [
    ['Time', `${test.minutes} min`],
    ['For', `Ages ${test.minAge}+`],
    test.kind === 'questionnaire' ? ['Type', 'Questions'] : ['Eyes', test.eachEye ? 'One at a time' : 'Both together'],
  ];

  return (
    <Screen scroll>
      <ScreenHeader left="back" onLeft={() => router.back()} title={category.title} small />

      <TestArt testId={test.id} />

      <View>
        <Text style={styles.title}>{test.name}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
      </View>

      <View style={styles.facts}>
        {facts.map(([label, value]) => (
          <View key={label} style={styles.fact}>
            <Text style={styles.factLabel}>{label}</Text>
            <Text style={styles.factValue}>{value}</Text>
          </View>
        ))}
      </View>

      <View>
        <Text style={styles.heading}>What it checks</Text>
        <Text style={styles.body}>{copy.checks}</Text>
      </View>

      <View>
        <Text style={styles.heading}>Who it&apos;s for</Text>
        <View style={styles.list}>
          {copy.whoFor.map((line) => (
            <View key={line} style={styles.item}>
              <View style={styles.tick}>
                <Icon name="check" size={12} color={Colors.accInk} strokeWidth={2.4} />
              </View>
              <Text style={styles.itemText}>{line}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.spacer} />
      <Button title={starting ? 'Starting…' : 'Start test'} arrow={!starting} onPress={start} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...Type.title, marginTop: 4, color: Colors.ink },
  subtitle: { fontFamily: Fonts.regular, fontSize: 16, marginTop: 4, color: Colors.muted },
  facts: { flexDirection: 'row', gap: 10 },
  fact: {
    flex: 1,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  factLabel: { fontFamily: Fonts.semibold, fontSize: 12, color: Colors.muted },
  factValue: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 21, color: Colors.ink },
  heading: { fontFamily: Fonts.bold, fontSize: 17, color: Colors.ink },
  body: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, marginTop: 6, color: Colors.inkSoft },
  list: { marginTop: 8, gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tick: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: { flex: 1, fontFamily: Fonts.regular, fontSize: 16, color: Colors.inkSoft },
  spacer: { flex: 1, minHeight: 0 },
});
