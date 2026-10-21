import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { HeaderButton } from '@/components/ScreenHeader';
import { Text, TextInput } from '@/components/Text';
import { searchTests } from '@/constants/library';
import { CATEGORIES } from '@/constants/tests';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

const MAX = 6;

/** "Distance acuity" with the matched part highlighted. */
function Highlight({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLowerCase().indexOf(query) : -1;
  if (at < 0) return <Text style={styles.rowTitle}>{text}</Text>;
  return (
    <Text style={styles.rowTitle}>
      {text.slice(0, at)}
      <Text style={styles.hit}>{text.slice(at, at + query.length)}</Text>
      {text.slice(at + query.length)}
    </Text>
  );
}

/** Screen 53: Test library search, by test name, group or symptom ("blurry", "night"). */
export default function Search() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const results = searchTests(query);
  const shown = results.slice(0, q ? results.length : MAX);

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.md }]}>
      <View style={styles.bar}>
        <HeaderButton icon="chevronLeft" label="Back" onPress={() => router.back()} />
        <View style={styles.field}>
          <View style={styles.searchIcon} pointerEvents="none">
            <Icon name="search" size={20} color={Colors.muted} />
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder="Search tests or symptoms"
            placeholderTextColor={Colors.faint}
            accessibilityLabel="Search tests"
            returnKeyType="search"
            style={styles.input}
          />
          {query.length > 0 && (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={styles.clear}>
              <View style={styles.clearDot}>
                <Icon name="close" size={10} color={Colors.white} strokeWidth={3} />
              </View>
            </Pressable>
          )}
        </View>
      </View>

      {results.length > 0 ? (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}>
          <Text style={styles.count}>
            {q ? `${results.length} ${results.length === 1 ? 'test' : 'tests'} for “${query.trim()}”` : 'Popular tests'}
          </Text>
          <View style={styles.list}>
            {shown.map((t, i) => (
              <Pressable
                key={t.id}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/tests/[testId]', params: { testId: t.id } })}
                style={({ pressed }) => [styles.row, i > 0 && styles.divider, pressed && styles.pressed]}>
                <View style={styles.num}>
                  <Text style={styles.numText}>{i + 1}</Text>
                </View>
                <View style={styles.rowText}>
                  <Highlight text={t.name} query={q} />
                  <Text style={styles.rowSub}>
                    {CATEGORIES.find((c) => c.id === t.category)?.tile} · {t.kind === 'questionnaire' ? 'Questionnaire · ' : ''}
                    {t.minutes} min
                  </Text>
                </View>
                <Icon name="chevronRight" size={16} color={Colors.faint} strokeWidth={2.2} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.none}>
          <View style={styles.noneIcon}>
            <Icon name="searchMinus" size={30} strokeWidth={1.8} />
          </View>
          <Text style={styles.noneTitle}>No tests found</Text>
          <Text style={styles.noneBody}>Nothing matches “{query.trim()}”. Try a word like blurry, colour or night.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.browse}>
            <Text style={styles.browseText}>Browse all tests</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  bar: { paddingHorizontal: Spacing.xl, flexDirection: 'row', alignItems: 'center', gap: 10 },
  field: { flex: 1, justifyContent: 'center' },
  searchIcon: { position: 'absolute', left: 14, zIndex: 1 },
  input: {
    minHeight: 48,
    paddingLeft: 42,
    paddingRight: 44,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.ink,
    backgroundColor: Colors.card,
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.ink,
  },
  clear: { position: 'absolute', right: 2, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  clearDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#CFCFCA', alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: Spacing.xl },
  count: { marginTop: 22, marginLeft: 4, fontFamily: Fonts.semibold, fontSize: 14, color: Colors.muted },
  list: { marginTop: 10, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, overflow: 'hidden' },
  row: { minHeight: 66, paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.divider },
  pressed: { backgroundColor: Colors.pressed },
  num: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.accSoft, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.accInk },
  rowText: { flex: 1, minWidth: 0, gap: 2 },
  rowTitle: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 20, color: Colors.ink },
  hit: { backgroundColor: Colors.accSoft },
  rowSub: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted },
  none: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingBottom: 40 },
  noneIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.pill, alignItems: 'center', justifyContent: 'center' },
  noneTitle: { marginTop: 18, fontFamily: Fonts.bold, fontSize: 22, letterSpacing: -0.3, color: Colors.ink },
  noneBody: { marginTop: 8, maxWidth: 290, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, textAlign: 'center', color: Colors.muted },
  browse: {
    marginTop: 22,
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.card,
    justifyContent: 'center',
  },
  browseText: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.ink },
});
