import { StyleSheet } from 'react-native';

import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { Colors, Type } from '@/constants/theme';

/** Temporary body for screens that are not built yet. */
export function Placeholder({ screen }: { screen: string }) {
  return (
    <Card>
      <Text style={Type.rowTitle}>{screen}</Text>
      <Text style={styles.note}>Placeholder. This screen is built in a later task.</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  note: { ...Type.caption, color: Colors.muted, marginTop: 4 },
});
