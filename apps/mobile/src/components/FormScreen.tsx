import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';

/** Scrollable, keyboard-aware page for forms (Sign up, Log in, Onboarding...). */
export function FormScreen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={styles.root} behavior="padding">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.xxl }]}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { flexGrow: 1, paddingHorizontal: Spacing.xl },
});
