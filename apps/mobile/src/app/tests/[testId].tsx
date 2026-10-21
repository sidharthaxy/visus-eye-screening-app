import { TestId } from '@visus/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { CATEGORIES, TEST_COPY, testInfo } from '@/constants/tests';
import { Colors, Fonts, Radius, Type } from '@/constants/theme';

/** Rows of the tumbling-E illustration: [font size, gap, rotations]. */
const E_ROWS: [number, number, number[]][] = [
  [52, 0, [0]],
  [32, 18, [90, 180, 0]],
  [20, 14, [270, 0, 90, 180]],
  [13, 10, [0, 180, 270, 0, 90]],
];

/** Screen 8: Test detail. */
export default function TestDetail() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  const parsed = TestId.safeParse(testId);
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
  const category = CATEGORIES.find((c) => c.id === test.category)!;
  const isE = test.id === 'tumbling_e' || test.id === 'kids_tumbling_e';
  const facts: [string, string][] = [
    ['Time', `${test.minutes} min`],
    ['For', `Ages ${test.minAge}+`],
    test.kind === 'questionnaire' ? ['Type', 'Questions'] : ['Eyes', test.eachEye ? 'One at a time' : 'Both together'],
  ];

  return (
    <Screen scroll>
      <ScreenHeader left="back" onLeft={() => router.back()} title={category.title} small />

      <Card style={styles.art}>
        {isE ? (
          E_ROWS.map(([size, gap, turns]) => (
            <View key={size} style={[styles.eRow, { gap }]}>
              {turns.map((deg, i) => (
                <Text key={i} style={[styles.e, { fontSize: size, lineHeight: size, transform: [{ rotate: `${deg}deg` }] }]}>
                  E
                </Text>
              ))}
            </View>
          ))
        ) : category.icon === 'E' ? (
          <Text style={[styles.e, { fontSize: 64, lineHeight: 64 }]}>E</Text>
        ) : (
          <Icon name={category.icon} size={84} strokeWidth={1.6} />
        )}
      </Card>

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
      {/* Goes to /check/[testId]/instructions (group 3). */}
      <Button title="Start test" arrow />
    </Screen>
  );
}

const styles = StyleSheet.create({
  art: { height: 168, borderRadius: Radius.hero, alignItems: 'center', justifyContent: 'center', gap: 12 },
  eRow: { flexDirection: 'row' },
  e: { fontFamily: Fonts.bold, color: Colors.ink },
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
