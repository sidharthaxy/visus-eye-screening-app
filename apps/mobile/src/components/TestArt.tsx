import type { TestId } from '@visus/shared';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { FixedText } from '@/components/Text';
import { CATEGORIES, testInfo } from '@/constants/tests';
import { Colors, Fonts, Radius } from '@/constants/theme';

/** Rows of the tumbling-E illustration: [font size, gap, rotations]. */
const E_ROWS: [number, number, number[]][] = [
  [52, 0, [0]],
  [32, 18, [90, 180, 0]],
  [20, 14, [270, 0, 90, 180]],
  [13, 10, [0, 180, 270, 0, 90]],
];

/** White card illustrating a test: the E chart for tumbling E, else the category icon. */
export function TestArt({ testId, height = 168 }: { testId: TestId; height?: number }) {
  const icon = CATEGORIES.find((c) => c.id === testInfo(testId)?.category)?.icon ?? 'eye';
  const isE = testId === 'tumbling_e' || testId === 'kids_tumbling_e';

  return (
    <Card style={[styles.card, { height }]}>
      {isE ? (
        E_ROWS.map(([size, gap, turns]) => (
          <View key={size} style={[styles.row, { gap }]}>
            {turns.map((deg, i) => (
              <FixedText key={i} style={[styles.e, { fontSize: size, lineHeight: size, transform: [{ rotate: `${deg}deg` }] }]}>
                E
              </FixedText>
            ))}
          </View>
        ))
      ) : icon === 'E' ? (
        <FixedText style={[styles.e, { fontSize: 64, lineHeight: 64 }]}>E</FixedText>
      ) : (
        <Icon name={icon} size={84} strokeWidth={1.6} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.hero, alignItems: 'center', justifyContent: 'center', gap: 12 },
  row: { flexDirection: 'row' },
  e: { fontFamily: Fonts.bold, color: Colors.ink },
});
