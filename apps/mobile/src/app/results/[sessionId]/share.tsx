import type { Profile, ShareLink, Verdict } from '@visus/shared';
import * as Print from 'expo-print';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Share, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Button } from '@/components/Button';
import { LoadState } from '@/components/results';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { areasOf, eyeLines, fullDate, resultsReport } from '@/constants/report';
import { Colors, Fonts, StatusColors } from '@/constants/theme';
import { getMyProfile } from '@/services/profiles';
import { shareSession } from '@/services/sessions';
import { useVerdict } from '@/store/check';

const WHATSAPP_GREEN = '#1F9D55';

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The same report as the card, as a one-page PDF. */
function reportHtml(verdict: Verdict, who: string, link?: string) {
  const rows = areasOf(verdict)
    .map((a) => `<tr><td>${escape(a.tile)}</td><td style="color:${StatusColors[a.status].fg}">${StatusColors[a.status].label}</td></tr>`)
    .join('');
  const eyes = eyeLines(verdict).map((l) => `<p>${escape(l)}</p>`).join('');
  return `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:sans-serif;color:#111;padding:32px">
<p style="font-size:12px;font-weight:700;letter-spacing:.06em;color:#8A8A85">VISUS EYE CHECK REPORT</p>
<h1 style="margin:4px 0">${escape(who)}</h1>
<p style="color:#5F5F5B">${fullDate(verdict.date)} · ${verdict.results.length} tests</p>
<h2>${escape(verdict.headline)}</h2><p>${escape(verdict.advice)}</p>
<table style="width:100%;border-collapse:collapse;font-size:15px" cellpadding="8">${rows}</table>
${eyes}
${link ? `<p style="font-size:13px">Full report (valid 24 hours): ${escape(link)}</p>` : ''}
<p style="font-size:12px;color:#8A8A85">Screening, not diagnosis.</p>
</body></html>`;
}

/** Screen 20: Share report. A summary card, a QR link for a doctor, PDF and WhatsApp. */
export default function ShareReport() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { verdict, failed, retry } = useVerdict(sessionId);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [link, setLink] = useState<ShareLink | null>(null);
  const [linkFailed, setLinkFailed] = useState(false);
  const [pdf, setPdf] = useState<'idle' | 'busy' | 'done'>('idle');

  useEffect(() => {
    let live = true;
    getMyProfile()
      .then((p) => live && setProfile(p))
      .catch(() => undefined);
    shareSession(sessionId)
      .then((l) => live && setLink(l))
      .catch(() => live && setLinkFailed(true));
    return () => {
      live = false;
    };
  }, [sessionId]);

  if (!verdict) {
    return (
      <Screen>
        <ScreenHeader left="back" onLeft={() => router.back()} title="Share report" />
        <LoadState failed={failed} onRetry={retry} />
      </Screen>
    );
  }

  const who = profile ? `${profile.name}, ${profile.age}` : '';
  const tests = verdict.results.length;

  async function downloadPdf(v: Verdict) {
    setPdf('busy');
    try {
      const { uri } = await Print.printToFileAsync({ html: reportHtml(v, who, link?.url) });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Save or send the report' });
      setPdf('done');
    } catch {
      setPdf('idle');
    }
  }

  function whatsApp(v: Verdict) {
    const message = resultsReport(v, link?.url);
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`).catch(() =>
      Share.share({ title: 'Visus eye check', message }),
    );
  }

  return (
    <Screen scroll>
      <View style={styles.root}>
        <ScreenHeader left="back" onLeft={() => router.back()} title="Share report" />

        <View style={styles.report}>
          <View style={styles.reportTop}>
            <View style={styles.reportWho}>
              <Text style={styles.kicker}>VISUS EYE CHECK REPORT</Text>
              <Text style={styles.name}>{who}</Text>
            </View>
            <Text style={styles.meta}>
              {fullDate(verdict.date)}
              {'\n'}
              {tests} {tests === 1 ? 'test' : 'tests'}
            </Text>
          </View>

          <View style={styles.areas}>
            {areasOf(verdict).map((a) => (
              <View key={a.id} style={styles.area}>
                <Text style={styles.areaName}>{a.tile}</Text>
                <View style={styles.areaStatus}>
                  <View style={[styles.dot, { backgroundColor: StatusColors[a.status].dot }]} />
                  <Text style={[styles.areaLabel, { color: StatusColors[a.status].fg }]}>{StatusColors[a.status].label}</Text>
                </View>
              </View>
            ))}
          </View>

          {eyeLines(verdict).length > 0 && (
            <View style={styles.eyes}>
              {eyeLines(verdict).map((line) => (
                <Text key={line} style={styles.eyeLine}>
                  {line}
                </Text>
              ))}
            </View>
          )}
          <Text style={styles.disclaimer}>Screening, not diagnosis.</Text>
        </View>

        <View style={styles.qrCard}>
          <View style={styles.qr}>
            {link ? (
              <QRCode value={link.url} size={92} color={Colors.ink} backgroundColor={Colors.white} />
            ) : linkFailed ? (
              <Text style={styles.qrError}>No link</Text>
            ) : (
              <ActivityIndicator color={Colors.ink} />
            )}
          </View>
          <View style={styles.qrText}>
            <Text style={styles.qrTitle}>Show to your doctor</Text>
            <Text style={styles.qrBody}>
              {linkFailed
                ? "Couldn't make a link. Check your internet connection, or use the PDF."
                : 'They scan it to open the full report. The link expires in 24 hours.'}
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />
        <View style={styles.actions}>
          <Button
            title={pdf === 'done' ? 'PDF ready' : pdf === 'busy' ? 'Making PDF…' : 'Download PDF'}
            icon={pdf === 'done' ? 'checkLarge' : 'download'}
            disabled={pdf === 'busy'}
            onPress={() => void downloadPdf(verdict)}
          />
          <Button title="Share on WhatsApp" variant="secondary" icon="whatsapp" iconColor={WHATSAPP_GREEN} onPress={() => whatsApp(verdict)} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  report: {
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    shadowColor: Colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  reportTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  reportWho: { flex: 1, gap: 2 },
  kicker: { fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 0.72, color: '#8A8A85' },
  name: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.ink },
  meta: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, textAlign: 'right', color: Colors.muted },
  areas: { marginTop: 14 },
  area: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  areaName: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.ink },
  areaStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  areaLabel: { fontFamily: Fonts.semibold, fontSize: 14 },
  eyes: { marginTop: 6, paddingTop: 12, gap: 4, borderTopWidth: 1, borderTopColor: Colors.divider },
  eyeLine: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: Colors.inkSoft },
  disclaimer: { marginTop: 12, fontFamily: Fonts.regular, fontSize: 11, color: '#8A8A85' },
  qrCard: {
    marginTop: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  qr: { width: 92, height: 92, alignItems: 'center', justifyContent: 'center' },
  qrError: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.muted },
  qrText: { flex: 1, gap: 4 },
  qrTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.ink },
  qrBody: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19, color: Colors.muted },
  spacer: { flex: 1, minHeight: 16 },
  actions: { gap: 10 },
});
