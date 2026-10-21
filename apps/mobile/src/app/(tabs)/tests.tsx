import { TEST_CATALOG, type Category } from '@visus/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { CATEGORIES, testListSub, testsIn } from '@/constants/tests';
import { Colors, Fonts, Radius, Type } from '@/constants/theme';

/** Screen 4: Tests library. */
export default function Tests() {
  const [selected, setSelected] = useState<Category>('clarity');
  const category = CATEGORIES.find((c) => c.id === selected)!;
  const tests = testsIn(selected);

  return (
    <Screen tabs scroll eyebrow={`${TEST_CATALOG.length} tests in ${CATEGORIES.length} groups`} title="Tests">
      <View style={styles.tiles}>
        {CATEGORIES.map((c) => {
          const on = c.id === selected;
          const color = on ? Colors.white : Colors.ink;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => setSelected(c.id)}
              style={({ pressed }) => [styles.tile, on && styles.tileOn, pressed && styles.pressed]}>
              {c.icon === 'E' ? (
                <Text style={[styles.tileE, { color }]}>E</Text>
              ) : (
                <Icon name={c.icon} size={24} color={color} />
              )}
              <Text style={[styles.tileLabel, { color }]}>{c.tile}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionText}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{category.title}</Text>
            <Text style={styles.count}>
              {tests.length} {tests.length === 1 ? 'test' : 'tests'}
            </Text>
          </View>
          <Text style={styles.question}>{category.question}</Text>
        </View>
        <Card flush>
          {tests.map((t, i) => (
            <ListRow
              key={t.id}
              first={i === 0}
              minHeight={66}
              accent
              icon={String(i + 1)}
              title={t.name}
              subtitle={testListSub(t)}
              onPress={() => router.push({ pathname: '/tests/[testId]', params: { testId: t.id } })}
            />
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  tile: {
    // Three per row: (100% - 2 gaps of 10) / 3.
    width: '31.4%',
    flexGrow: 1,
    height: 80,
    borderRadius: Radius.tile,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tileOn: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  pressed: { transform: [{ scale: 0.97 }] },
  tileE: { fontFamily: Fonts.bold, fontSize: 21, lineHeight: 24 },
  tileLabel: { ...Type.label },
  section: { gap: 14, marginTop: 8 },
  sectionText: { gap: 4 },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { ...Type.h2, color: Colors.ink },
  count: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted },
  question: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 23, color: Colors.muted },
});
