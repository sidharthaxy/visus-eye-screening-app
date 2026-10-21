import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { Colors, Fonts, StatusColors } from '@/constants/theme';
import { WEB_URL } from '@/services/api';

const DOES = ['Screen your vision', 'Track changes over time', 'Remind you to rest your eyes'];
const DOESNT = ['Diagnose conditions', 'Replace an eye exam', 'Prescribe glasses or medicine'];
const LINKS: [string, string][] = [
  ['Terms of use', '/terms'],
  ['Privacy policy', '/privacy'],
  ['Licences', '/licences'],
];

/** Screen 25: About & disclaimer. */
export default function About() {
  return (
    <Screen scroll>
      <View style={styles.root}>
        <ScreenHeader left="back" onLeft={() => router.back()} title="About" />

        <View style={styles.titleRow}>
          <Text style={styles.title}>Visus</Text>
          <Text style={styles.version}>Version {Constants.expoConfig?.version ?? '1.0'}</Text>
        </View>
        <Text style={styles.lead}>Quick eye screening you can do at home, in a few minutes.</Text>

        <View style={styles.lists}>
          <List title="It does" items={DOES} good />
          <List title="It doesn't" items={DOESNT} />
        </View>

        <View style={styles.card}>
          <View style={[styles.cardIcon, { backgroundColor: Colors.accSoft }]}>
            <Icon name="padlock" size={18} color={Colors.accInk} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>How your data is used</Text>
            <Text style={styles.cardBody}>
              Tests run on your phone. Only your answers go to our AI, and results are saved securely to your account. The
              camera only measures distance and never records.
            </Text>
          </View>
        </View>

        <View style={[styles.card, styles.cardStrong]}>
          <View style={[styles.cardIcon, { backgroundColor: Colors.ink }]}>
            <Icon name="infoMark" size={18} color={Colors.white} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Screening, not diagnosis</Text>
            <Text style={[styles.cardBody, styles.cardBodyStrong]}>
              Results point out signs worth checking. Only an eye doctor can diagnose. If your vision changes suddenly, see
              one right away.
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />
        <View style={styles.links}>
          {LINKS.map(([label, path]) => (
            <Pressable key={label} accessibilityRole="link" onPress={() => void Linking.openURL(`${WEB_URL}${path}`)} style={styles.link}>
              <Text style={styles.linkText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

function List({ title, items, good }: { title: string; items: string[]; good?: boolean }) {
  return (
    <View style={styles.list}>
      <Text style={styles.listTitle}>{title}</Text>
      {items.map((item) => (
        <View key={item} style={styles.item}>
          <View style={[styles.mark, { backgroundColor: good ? StatusColors.good.bg : Colors.fill }]}>
            {good ? (
              <Icon name="check" size={10} color={StatusColors.good.fg} strokeWidth={2.6} />
            ) : (
              <Icon name="close" size={9} color={Colors.muted} strokeWidth={3} />
            )}
          </View>
          <Text style={styles.itemText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  titleRow: { marginTop: 20, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  title: { fontFamily: Fonts.bold, fontSize: 28, letterSpacing: -0.7, color: Colors.ink },
  version: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.muted },
  lead: { marginTop: 6, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: Colors.muted },
  lists: { marginTop: 18, flexDirection: 'row', gap: 10 },
  list: { flex: 1, padding: 14, gap: 10, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  listTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.ink },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  mark: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 19, color: Colors.inkSoft },
  card: {
    marginTop: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  cardStrong: { borderColor: Colors.ink },
  cardIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.ink },
  cardBody: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: Colors.muted },
  cardBodyStrong: { color: Colors.inkSoft },
  spacer: { flex: 1, minHeight: 16 },
  links: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', columnGap: 24 },
  link: { minHeight: 44, justifyContent: 'center' },
  linkText: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.ink },
});
