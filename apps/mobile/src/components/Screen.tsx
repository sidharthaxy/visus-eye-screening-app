import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tabBarSpace } from '@/components/BottomTabBar';
import { Colors, Spacing, Type } from '@/constants/theme';

type Props = {
  children?: ReactNode;
  /** Small grey line above the title, e.g. the date on Home. */
  eyebrow?: string;
  title?: string;
  /** Leaves room for the floating tab bar. */
  tabs?: boolean;
  scroll?: boolean;
  /** Page colour; pearl unless a test needs plain white. */
  background?: string;
};

/** Pearl background, safe-area top padding and the 20px side gutter. */
export function Screen({ children, eyebrow, title, tabs, scroll, background }: Props) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + Spacing.md,
    paddingBottom: tabs ? tabBarSpace(insets.bottom) : insets.bottom + Spacing.xxl,
  };
  const content = (
    <>
      {(eyebrow || title) && (
        <View style={styles.header}>
          {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
          {title && <Text style={styles.title}>{title}</Text>}
        </View>
      )}
      {children}
    </>
  );

  if (scroll) {
    return (
      <ScrollView style={[styles.root, background && { backgroundColor: background }]} contentContainerStyle={[styles.content, padding]}>
        {content}
      </ScrollView>
    );
  }
  return <View style={[styles.root, background && { backgroundColor: background }, styles.content, padding]}>{content}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { flexGrow: 1, paddingHorizontal: Spacing.xl, gap: Spacing.lg },
  header: { gap: 2 },
  eyebrow: { ...Type.label, color: Colors.muted },
  title: { ...Type.title, color: Colors.ink },
});
