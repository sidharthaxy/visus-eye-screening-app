// Screen 55: Error. Used wherever a page can't load, and as the app's crash screen.
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { Colors, Fonts } from '@/constants/theme';

type Props = {
  /** May return a promise: the button says "Retrying…" until it settles. */
  onRetry: () => unknown;
  body?: string;
};

export function ErrorState({ onRetry, body = "We couldn't load this page. Check your internet connection. Your saved checks are safe." }: Props) {
  const [busy, setBusy] = useState(false);

  async function retry() {
    if (busy) return;
    setBusy(true);
    try {
      await onRetry();
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.centre}>
        <View style={styles.icon}>
          <Icon name="alertCircle" size={36} strokeWidth={1.7} />
        </View>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
      <Button title={busy ? 'Retrying…' : 'Retry'} icon="restart" disabled={busy} onPress={() => void retry()} />
      <Button title="Go to Home" variant="ghost" onPress={() => router.dismissTo('/home')} style={styles.home} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centre: { flex: 1, minHeight: 280, alignItems: 'center', justifyContent: 'center', paddingBottom: 24 },
  icon: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.pill, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 24, fontFamily: Fonts.bold, fontSize: 28, lineHeight: 32, letterSpacing: -0.7, textAlign: 'center', color: Colors.ink },
  body: { marginTop: 10, maxWidth: 300, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, textAlign: 'center', color: Colors.muted },
  home: { marginTop: 4, height: 44 },
});
