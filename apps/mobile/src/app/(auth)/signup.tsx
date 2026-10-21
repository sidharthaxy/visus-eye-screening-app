import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { Colors, Fonts, StatusColors, Type } from '@/constants/theme';
import { signup } from '@/services/auth';

const GREEN = StatusColors.good.fg;

/** Screen 39: Sign up. */
export default function SignUp() {
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const longEnough = password.length >= 8;
  const matches = confirm.length > 0 && password === confirm;
  const valid = name.trim().length > 0 && identifier.trim().length >= 3 && longEnough && matches;

  async function submit() {
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    try {
      await signup({ name, identifier, password });
      router.replace('/onboarding');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create your account.');
      setBusy(false);
    }
  }

  return (
    <FormScreen>
      <ScreenHeader left="back" onLeft={() => router.back()} title="Sign up" />
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.intro}>Save your results and see how your eyes change over time.</Text>

      <View style={styles.fields}>
        <TextField label="Full name" value={name} onChangeText={setName} placeholder="Your name" autoComplete="name" textContentType="name" />
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
          placeholder="Create a password"
          autoComplete="new-password"
          hint={
            <View style={styles.hint}>
              <Icon name="check" size={14} color={longEnough ? GREEN : '#8A8A85'} strokeWidth={2.2} />
              <Text style={[styles.hintText, { color: longEnough ? GREEN : '#8A8A85' }]}>At least 8 characters</Text>
            </View>
          }
        />
        <TextField
          label="Confirm password"
          password
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Type it again"
          autoComplete="new-password"
          hint={
            <Text style={[styles.match, { color: matches ? GREEN : StatusColors.mild.fg }]}>
              {confirm.length === 0 ? '' : matches ? 'Passwords match' : "Passwords don't match yet"}
            </Text>
          }
        />
      </View>

      <View style={styles.spacer} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={busy ? 'Creating account…' : 'Create account'} disabled={!valid} onPress={submit} />
      <Text style={styles.footer}>
        Already have an account?{' '}
        <Text style={styles.link} onPress={() => router.replace('/login')}>
          Log in
        </Text>
      </Text>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  title: { ...Type.question, letterSpacing: -0.7, marginTop: 20, color: Colors.ink },
  intro: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: Colors.muted, marginTop: 6 },
  fields: { marginTop: 22, gap: 14 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hintText: { ...Type.caption },
  match: { ...Type.caption, minHeight: 18 },
  spacer: { flex: 1, minHeight: 16 },
  error: { ...Type.caption, color: StatusColors.see_doctor.fg, textAlign: 'center', marginBottom: 10 },
  footer: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.muted, textAlign: 'center', marginTop: 14 },
  link: { fontFamily: Fonts.bold, color: Colors.ink },
});
