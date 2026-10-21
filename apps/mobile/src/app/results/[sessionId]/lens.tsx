import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { LoadState } from '@/components/results';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { Lens } from '@/constants/report';
import { Colors, Fonts, Radius, Sizes } from '@/constants/theme';
import { getMyProfile, updateProfile } from '@/services/profiles';
import { useVerdict } from '@/store/check';

/** Screen 19: Lens recommendation. The server's ZEISS suggestions, best match first. */
export default function LensRecommendation() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { verdict, failed, retry } = useVerdict(sessionId);
  // Saved to the owner's profile (Profile → Saved lens).
  const [saved, setSaved] = useState(false);
  const best = verdict?.lens[0];

  useEffect(() => {
    if (!best) return;
    let live = true;
    getMyProfile()
      .then((p) => live && setSaved(p.savedLens?.sessionId === sessionId && p.savedLens.product === best.product))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [best, sessionId]);

  async function toggleSave(product: string) {
    const next = !saved;
    setSaved(next);
    try {
      const me = await getMyProfile();
      await updateProfile(me.id, { savedLens: next ? { product, sessionId } : null });
    } catch {
      setSaved(!next);
    }
  }

  if (!verdict || verdict.lens.length === 0) {
    return (
      <Screen>
        <ScreenHeader left="back" onLeft={() => router.back()} title="Lens suggestions" />
        {verdict ? (
          <Text style={styles.empty}>No lens suggestions for this check. Your optician can advise you.</Text>
        ) : (
          <LoadState failed={failed} onRetry={retry} />
        )}
      </Screen>
    );
  }

  const others = verdict.lens.slice(1);
  const top = verdict.lens[0];

  return (
    <Screen scroll>
      <View style={styles.root}>
        <ScreenHeader left="back" onLeft={() => router.back()} title="Lens suggestions" />

        <Text style={styles.eyebrow}>Based on today&apos;s check</Text>
        <Text style={styles.title}>Lenses that suit you</Text>

        <View style={[styles.lens, styles.best]}>
          <View style={styles.lensTop}>
            <View style={styles.bestTag}>
              <Text style={styles.bestTagText}>Best match</Text>
            </View>
            <Text style={styles.lensType}>{top.lensType}</Text>
          </View>
          <Text style={styles.product}>{top.product}</Text>
          <View style={styles.why}>
            <Text style={styles.whyLabel}>Why this suits you</Text>
            <Text style={styles.whyText}>{top.reason}</Text>
          </View>
        </View>

        {others.map((l) => (
          <OtherLens key={l.product} lens={l} />
        ))}

        {top.coatings.length > 0 && (
          <>
            <Text style={styles.h3}>Coatings</Text>
            <View style={styles.coatings}>
              {top.coatings.map((c, i) => (
                <View key={c.name} style={[styles.coating, i > 0 && styles.coatingDivider]}>
                  <View style={styles.coatingIcon}>
                    <Icon name={/blue/i.test(c.name) ? 'screen' : 'shield'} size={20} strokeWidth={1.9} />
                  </View>
                  <View style={styles.coatingText}>
                    <Text style={styles.coatingName}>{c.name}</Text>
                    <Text style={styles.coatingReason}>{c.reason}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.note}>Your optician will confirm the final prescription and lens.</Text>

        <View style={styles.spacer} />
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Saved' : 'Save'}
            accessibilityState={{ selected: saved }}
            onPress={() => void toggleSave(top.product)}
            style={({ pressed }) => [styles.save, saved && styles.saveOn, pressed && styles.pressed]}>
            <Icon name={saved ? 'bookmarkOn' : 'bookmark'} size={20} />
            <Text style={styles.saveText}>{saved ? 'Saved' : 'Save'}</Text>
          </Pressable>
          <Button
            title="Show at store"
            onPress={() => router.push({ pathname: '/results/[sessionId]/share', params: { sessionId } })}
            style={styles.show}
          />
        </View>
      </View>
    </Screen>
  );
}

/** A further suggestion, below the best match. */
function OtherLens({ lens }: { lens: Lens }) {
  return (
    <View style={[styles.lens, styles.other]}>
      <Text style={styles.lensType}>{lens.lensType}</Text>
      <Text style={styles.product}>{lens.product}</Text>
      <Text style={styles.otherReason}>{lens.reason}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  empty: { marginTop: 24, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: Colors.muted },
  eyebrow: { marginTop: 20, fontFamily: Fonts.semibold, fontSize: 14, color: Colors.muted },
  title: { marginTop: 4, fontFamily: Fonts.bold, fontSize: 28, lineHeight: 32, letterSpacing: -0.7, color: Colors.ink },
  lens: { padding: 16, gap: 10, borderRadius: 22, borderWidth: 1, backgroundColor: Colors.card },
  best: { marginTop: 16, borderColor: Colors.ink },
  other: { marginTop: 10, gap: 6, borderColor: Colors.border },
  lensTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  bestTag: { height: 24, paddingHorizontal: 10, borderRadius: Radius.pill, backgroundColor: Colors.ink, justifyContent: 'center' },
  bestTagText: { fontFamily: Fonts.semibold, fontSize: 12, color: Colors.white },
  lensType: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted },
  product: { fontFamily: Fonts.bold, fontSize: 21, letterSpacing: -0.3, color: Colors.ink },
  why: { padding: 12, gap: 3, borderRadius: 14, backgroundColor: Colors.accSoft },
  whyLabel: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.accInk },
  whyText: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: Colors.inkSoft },
  otherReason: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: Colors.muted },
  h3: { marginTop: 20, fontFamily: Fonts.bold, fontSize: 17, color: Colors.ink },
  coatings: {
    marginTop: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    overflow: 'hidden',
  },
  coating: { minHeight: 74, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  coatingDivider: { borderTopWidth: 1, borderTopColor: Colors.divider },
  coatingIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.fill, alignItems: 'center', justifyContent: 'center' },
  coatingText: { flex: 1, minWidth: 0, gap: 2 },
  coatingName: { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.ink },
  coatingReason: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: Colors.muted },
  note: { marginTop: 12, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, color: Colors.muted },
  spacer: { flex: 1, minHeight: 16 },
  actions: { flexDirection: 'row', gap: 10 },
  save: {
    minHeight: Sizes.button,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.card,
  },
  saveOn: { borderColor: Colors.ink },
  pressed: { transform: [{ scale: 0.98 }] },
  saveText: { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.ink },
  show: { flex: 1 },
});
