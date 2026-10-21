// Screen 27: Near reading. Lines of text from N36 down to N6 at 40 cm, in
// English, Hindi or Odia; tap the smallest line you can read clearly.
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { TestHeader } from '@/components/TestHeader';
import { FixedText, Text } from '@/components/Text';
import { Colors, Fonts } from '@/constants/theme';
import { DISTANCE_CM, EYE_LABEL, usePxPerMm, type TestProps } from '@/tests/parts';

/** N-scale: N is the print size in typographic points (1 pt = 0.3528 mm). */
const LINES = [36, 24, 18, 14, 12, 10, 8, 6];
const POINT_MM = 0.3528;

const LANGS = [
  { id: 'en', label: 'EN' },
  { id: 'hi', label: 'हिं' },
  { id: 'or', label: 'ଓଡ଼ିଆ' },
] as const;
type Lang = (typeof LANGS)[number]['id'];

/** The phone's own font, which has Devanagari and Odia (Figtree doesn't). */
const SYSTEM_FONT = Platform.select({ android: 'sans-serif', default: undefined });

const TEXT: Record<Lang, string[]> = {
  en: ['Sun is up', 'Birds sing at dawn', 'We walk to the market', 'Mother cooks rice for lunch', 'The train leaves at nine today', 'Children play in the park after school', 'Drink clean water and rest your eyes often', 'Regular eye checks help you see clearly for years'],
  hi: ['सूरज निकला', 'सुबह पक्षी गाते हैं', 'हम बाज़ार जाते हैं', 'माँ दोपहर का खाना बनाती है', 'रेलगाड़ी नौ बजे चलती है', 'बच्चे स्कूल के बाद पार्क में खेलते हैं', 'साफ़ पानी पिएँ और आँखों को आराम दें', 'नियमित आँखों की जाँच से आप सालों तक साफ़ देखते हैं'],
  or: ['ସୂର୍ଯ୍ୟ ଉଠିଲା', 'ସକାଳେ ପକ୍ଷୀ ଗାନ କରନ୍ତି', 'ଆମେ ବଜାରକୁ ଯାଉଛୁ', 'ମା ମଧ୍ୟାହ୍ନ ଭୋଜନ ରାନ୍ଧନ୍ତି', 'ଟ୍ରେନ ନଅଟାରେ ଛାଡ଼େ', 'ପିଲାମାନେ ସ୍କୁଲ ପରେ ପାର୍କରେ ଖେଳନ୍ତି', 'ସଫା ପାଣି ପିଅନ୍ତୁ ଓ ଆଖିକୁ ବିଶ୍ରାମ ଦିଅନ୍ତୁ', 'ନିୟମିତ ଆଖି ପରୀକ୍ଷା ଆପଣଙ୍କୁ ସ୍ପଷ୍ଟ ଦେଖିବାରେ ସାହାଯ୍ୟ କରେ'],
};

export function NearReading({ eye, onExit, onDone }: TestProps) {
  const { pxPerMm, calibrated } = usePxPerMm();
  const [lang, setLang] = useState<Lang>('en');
  const [picked, setPicked] = useState<number | null>(null);
  const label = (i: number) => `N${LINES[i]}`;

  return (
    <View style={styles.root}>
      <TestHeader title="Near reading" onExit={onExit} eyeLabel={EYE_LABEL[eye]} progress="Hold at 40 cm" />

      <View style={styles.segment}>
        {LANGS.map((l) => {
          const on = lang === l.id;
          return (
            <Pressable
              key={l.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setLang(l.id)}
              style={[styles.segmentItem, on && styles.segmentOn]}>
              <Text style={[styles.segmentText, l.id !== 'en' && styles.systemSemibold, on && styles.segmentTextOn]}>{l.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={styles.card} contentContainerStyle={styles.cardContent}>
        {LINES.map((n, i) => {
          const on = picked === i;
          return (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityLabel={label(i)}
              onPress={() => setPicked(on ? null : i)}
              style={[styles.line, i > 0 && styles.lineBorder, on && styles.lineOn]}>
              <Text style={[styles.lineLabel, on && styles.lineLabelOn]}>{label(i)}</Text>
              <FixedText
                style={[
                  styles.lineText,
                  // Figtree has no Devanagari or Odia: use the phone's own font for those.
                  lang !== 'en' && styles.systemMedium,
                  { fontSize: n * POINT_MM * pxPerMm },
                ]}>
                {TEXT[lang][i]}
              </FixedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.hint}>
        {picked === null ? 'Tap the smallest line you can read clearly.' : `Smallest clear line: ${label(picked)}`}
      </Text>
      <Button
        title={picked === null ? 'Confirm' : `Confirm ${label(picked)}`}
        disabled={picked === null}
        onPress={() =>
          picked !== null &&
          onDone({
            distanceCm: DISTANCE_CM,
            pxPerMm,
            calibrated,
            language: lang,
            smallestRead: label(picked),
            lines: LINES.map((n) => ({ label: `N${n}`, sizeMm: Number((n * POINT_MM).toFixed(2)) })),
          })
        }
        style={styles.confirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  segment: { marginTop: 14, height: 40, padding: 3, borderRadius: 999, backgroundColor: Colors.fill, flexDirection: 'row' },
  segmentItem: { flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  segmentOn: {
    backgroundColor: Colors.white,
    shadowColor: '#111111',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentText: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.tabInactive },
  segmentTextOn: { color: Colors.ink },
  systemSemibold: { fontFamily: SYSTEM_FONT, fontWeight: '600' },
  systemMedium: { fontFamily: SYSTEM_FONT, fontWeight: '500' },
  card: { flex: 1, marginTop: 14, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  cardContent: { flexGrow: 1 },
  line: {
    minHeight: 44,
    paddingVertical: 6,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lineBorder: { borderTopWidth: 1, borderTopColor: Colors.divider },
  lineOn: { backgroundColor: Colors.accSoft, borderWidth: 1.5, borderColor: Colors.ink },
  lineLabel: { width: 36, fontFamily: Fonts.bold, fontSize: 11, color: '#8A8A85' },
  lineLabelOn: { color: Colors.ink },
  lineText: { flex: 1, fontFamily: Fonts.medium, color: Colors.ink },
  hint: { marginTop: 12, textAlign: 'center', fontFamily: Fonts.semibold, fontSize: 15, color: Colors.inkSoft },
  confirm: { marginTop: 12 },
});
