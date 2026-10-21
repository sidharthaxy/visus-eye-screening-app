import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { Colors, Fonts, StatusColors, Type } from '@/constants/theme';
import { login } from '@/services/auth';
import { listProfiles } from '@/services/profiles';

/** Screen 40: Log in. */
export default function LogIn() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const valid = identifier.trim().length >= 3 && password.length > 0;

  async function submit() {
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    try {
      await login({ identifier, password });
      // An account that never finished onboarding has no profile yet.
      const profiles = await listProfiles();
      router.replace(profiles.length ? '/home' : '/onboarding');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not log you in.');
      setBusy(false);
    }
  }

  return (
    <FormScreen>
      <ScreenHeader left="back" onLeft={() => router.back()} title="Log in" />
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.intro}>Log in to see your checks and your family&apos;s.</Text>

      <View style={styles.fields}>
        <TextField
          label="Phone or email"
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="+91 98765 43210 or you@example.com"
          autoComplete="username"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField
          label="Password"
          password
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          autoComplete="current-password"
        />
      </View>

      <View style={styles.spacer} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={busy ? 'Logging in…' : 'Log in'} disabled={!valid} onPress={submit} />
      <Text style={styles.footer}>
        New to Visus?{' '}
        <Text style={styles.link} onPress={() => router.replace('/signup')}>
          Sign up
        </Text>
      </Text>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  title: { ...Type.question, letterSpacing: -0.7, marginTop: 20, color: Colors.ink },
  intro: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: Colors.muted, marginTop: 6 },
  fields: { marginTop: 22, gap: 14 },
  spacer: { flex: 1, minHeight: 16 },
  error: { ...Type.caption, color: StatusColors.see_doctor.fg, textAlign: 'center', marginBottom: 10 },
  footer: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.muted, textAlign: 'center', marginTop: 14 },
  link: { fontFamily: Fonts.bold, color: Colors.ink },
});
