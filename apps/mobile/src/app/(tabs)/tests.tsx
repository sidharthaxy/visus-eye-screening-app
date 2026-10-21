import { TEST_CATALOG, type Category, type TestInfo } from '@visus/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { FilterSheet } from '@/components/FilterSheet';
import { Icon } from '@/components/Icon';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { HeaderButton } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { filterTests, hasFilters, NO_FILTERS, type Filters } from '@/constants/library';
import { CATEGORIES, testListSub, testsIn } from '@/constants/tests';
import { Colors, Fonts, Radius, Type } from '@/constants/theme';

/** Screen 4: Tests library. */
export default function Tests() {
  const [selected, setSelected] = useState<Category>('clarity');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [sheet, setSheet] = useState(false);
  const category = CATEGORIES.find((c) => c.id === selected)!;
  const tests = testsIn(selected);
  const filtered = hasFilters(filters) ? filterTests(filters) : null;

  return (
    <Screen tabs scroll>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{`${TEST_CATALOG.length} tests in ${CATEGORIES.length} groups`}</Text>
          <Text style={styles.title}>Tests</Text>
        </View>
        <HeaderButton icon="search" label="Search tests" onPress={() => router.push('/tests/search')} />
        <HeaderButton icon="sliders" label="Filters" onPress={() => setSheet(true)} />
      </View>

      {filtered ? (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>
              {filtered.length} {filtered.length === 1 ? 'test' : 'tests'}
            </Text>
            <Pressable accessibilityRole="button" onPress={() => setFilters(NO_FILTERS)} hitSlop={8}>
              <Text style={styles.clear}>Clear filters</Text>
            </Pressable>
          </View>
          <TestList tests={filtered} />
        </View>
      ) : (
        <>
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
            <TestList tests={tests} />
          </View>
        </>
      )}

      <FilterSheet
        visible={sheet}
        value={filters}
        onClose={() => setSheet(false)}
        onApply={(f) => {
          setFilters(f);
          setSheet(false);
        }}
      />
    </Screen>
  );
}

/** Numbered test rows; a tap opens Test detail. */
function TestList({ tests }: { tests: TestInfo[] }) {
  return (
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
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  headerText: { flex: 1, gap: 2 },
  eyebrow: { ...Type.label, color: Colors.muted },
  title: { ...Type.title, color: Colors.ink },
  clear: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.ink },
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
