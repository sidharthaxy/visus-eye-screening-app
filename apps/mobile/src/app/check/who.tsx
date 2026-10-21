import type { Profile } from '@visus/shared';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { initials, RELATIONS } from '@/constants/profile';
import { Colors, Fonts, StatusColors } from '@/constants/theme';
import { listProfiles } from '@/services/profiles';
import { checkStartFor } from '@/store/check';

/** "You · 34 years", "Child · 8 years". */
function metaOf(p: Profile, owner: boolean) {
  const who = owner ? 'You' : (RELATIONS.find(([r]) => r === p.relation)?.[1] ?? 'Family');
  return `${who} · ${p.age} years`;
}

/** Screen 42: Who is this check for? Results are saved to that person's profile. */
export default function WhoIsThisFor() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [selected, setSelected] = useState(0);

  // Reload on focus, so someone just added (Add someone) shows up.
  useFocusEffect(
    useCallback(() => {
      let live = true;
      listProfiles().then((p) => live && setProfiles(p));
      return () => {
        live = false;
      };
    }, []),
  );

  return (
    <Screen scroll>
      <View style={styles.root}>
        <ScreenHeader left="back" onLeft={() => router.back()} title="New check" />
        <Text style={styles.title}>Who is this check for?</Text>
        <Text style={styles.sub}>We&apos;ll tune the tests and save results to their profile.</Text>

        {!profiles ? (
          <ActivityIndicator color={Colors.ink} style={styles.loading} />
        ) : (
          <View style={styles.list}>
            {profiles.map((p, i) => {
              const on = i === selected;
              return (
                <Pressable
                  key={p.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  onPress={() => setSelected(i)}
                  style={[styles.card, on && styles.cardOn]}>
                  <View style={[styles.avatar, i === 0 && styles.avatarMe]}>
                    <Text style={[styles.avatarText, i === 0 && styles.avatarTextMe]}>{initials(p.name)}</Text>
                  </View>
                  <View style={styles.text}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name} numberOfLines={1}>
                        {p.name}
                      </Text>
                      {p.isChild && (
                        <View style={styles.kids}>
                          <Text style={styles.kidsText}>Kids mode</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.meta}>{metaOf(p, i === 0)}</Text>
                  </View>
                  <View style={[styles.radio, on && styles.radioOn]}>
                    {on && <Icon name="check" size={12} color={Colors.white} strokeWidth={2.4} />}
                  </View>
                </Pressable>
              );
            })}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/profile/family/new')}
              style={({ pressed }) => [styles.add, pressed && styles.pressed]}>
              <Icon name="plusBold" size={18} />
              <Text style={styles.addText}>Add someone</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.spacer} />
        <Button
          title="Continue"
          disabled={!profiles}
          onPress={() => profiles && router.push(checkStartFor(profiles[Math.min(selected, profiles.length - 1)]))}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: { marginTop: 20, fontFamily: Fonts.bold, fontSize: 28, lineHeight: 32, letterSpacing: -0.7, color: Colors.ink },
  sub: { marginTop: 6, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: Colors.muted },
  loading: { marginTop: 40 },
  list: { marginTop: 22, gap: 10 },
  card: {
    minHeight: 76,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderOption,
    backgroundColor: Colors.card,
  },
  // The design's inset ring: a 2px border in ink, padding trimmed so nothing shifts.
  cardOn: { borderWidth: 2, borderColor: Colors.ink, paddingVertical: 11, paddingHorizontal: 15 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.fill, alignItems: 'center', justifyContent: 'center' },
  avatarMe: { backgroundColor: Colors.accSoft },
  avatarText: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.ink },
  avatarTextMe: { color: Colors.accInk },
  text: { flex: 1, minWidth: 0, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flexShrink: 1, fontFamily: Fonts.semibold, fontSize: 17, color: Colors.ink },
  kids: { minHeight: 22, paddingHorizontal: 8, borderRadius: 99, backgroundColor: StatusColors.mild.bg, justifyContent: 'center' },
  kidsText: { fontFamily: Fonts.semibold, fontSize: 12, color: StatusColors.mild.fg },
  meta: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CFCFCA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: Colors.ink, backgroundColor: Colors.ink },
  add: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.dashed,
  },
  pressed: { opacity: 0.7 },
  addText: { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.ink },
  spacer: { flex: 1, minHeight: 16 },
});
