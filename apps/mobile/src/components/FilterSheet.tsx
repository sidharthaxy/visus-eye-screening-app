// Screen 52: Test library filter. Bottom sheet over the Tests tab.
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Text } from '@/components/Text';
import { AGE, filterTests, hasFilters, NO_FILTERS, PROBLEMS, TIME, TYPE, type Filters } from '@/constants/library';
import { Colors, Fonts, Radius } from '@/constants/theme';

type Props = { visible: boolean; value: Filters; onApply: (f: Filters) => void; onClose: () => void };

function Segments({ list, value, onPick }: { list: string[]; value: number; onPick: (i: 0 | 1 | 2) => void }) {
  return (
    <View style={styles.segments}>
      {list.map((label, i) => (
        <Pressable
          key={label}
          accessibilityRole="tab"
          accessibilityState={{ selected: i === value }}
          onPress={() => onPick(i as 0 | 1 | 2)}
          style={[styles.segment, i === value && styles.segmentOn]}>
          <Text style={[styles.segmentText, i === value && styles.segmentTextOn]} numberOfLines={1}>
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function FilterSheet({ visible, value, onApply, onClose }: Props) {
  const insets = useSafeAreaInsets();
  // Edited here, applied with "Show N tests".
  const [draft, setDraft] = useState(value);
  const count = filterTests(draft).length;
  const set = (patch: Partial<Filters>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onShow={() => setDraft(value)} onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 34 }]}>
          <View style={styles.handle} />
          <View style={styles.top}>
            <Text style={styles.title}>Filters</Text>
            <Pressable accessibilityRole="button" disabled={!hasFilters(draft)} onPress={() => setDraft(NO_FILTERS)} style={styles.clear}>
              <Text style={[styles.clearText, !hasFilters(draft) && styles.off]}>Clear</Text>
            </Pressable>
          </View>

          <View style={styles.groups}>
            <View style={styles.group}>
              <Text style={styles.label}>Problem</Text>
              <View style={styles.chips}>
                {PROBLEMS.map(([id, label]) => {
                  const on = draft.problems.includes(id);
                  return (
                    <Chip
                      key={id}
                      compact
                      label={label}
                      selected={on}
                      onPress={() => set({ problems: on ? draft.problems.filter((p) => p !== id) : [...draft.problems, id] })}
                    />
                  );
                })}
              </View>
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Age</Text>
              <Segments list={AGE} value={draft.age} onPick={(age) => set({ age })} />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Type</Text>
              <Segments list={TYPE} value={draft.type} onPick={(type) => set({ type })} />
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Time</Text>
              <Segments list={TIME} value={draft.time} onPick={(time) => set({ time })} />
            </View>
          </View>

          <Button
            title={count ? `Show ${count} ${count === 1 ? 'test' : 'tests'}` : 'No tests match'}
            disabled={!count}
            onPress={() => onApply(draft)}
            style={styles.show}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17,17,17,0.42)' },
  sheet: {
    paddingTop: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: Colors.white,
    elevation: 12,
  },
  handle: { alignSelf: 'center', width: 36, height: 5, borderRadius: 99, backgroundColor: Colors.borderStrong },
  top: { marginTop: 12, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: Fonts.bold, fontSize: 22, letterSpacing: -0.3, color: Colors.ink },
  clear: { minHeight: 44, paddingHorizontal: 4, justifyContent: 'center' },
  clearText: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.ink },
  off: { opacity: 0.35 },
  groups: { marginTop: 12, gap: 20 },
  group: { gap: 10 },
  label: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segments: { minHeight: 44, padding: 3, flexDirection: 'row', borderRadius: Radius.pill, backgroundColor: Colors.fill },
  segment: { flex: 1, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  segmentOn: {
    backgroundColor: Colors.white,
    shadowColor: Colors.ink,
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentText: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.tabInactive },
  segmentTextOn: { color: Colors.ink },
  show: { marginTop: 26 },
});
