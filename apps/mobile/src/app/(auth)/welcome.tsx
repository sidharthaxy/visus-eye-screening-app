import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Placeholder } from '@/components/Placeholder';
import { Screen } from '@/components/Screen';

export default function Welcome() {
  return (
    <Screen title="Visus">
      <Placeholder screen="1. Entry" />
      <View style={styles.actions}>
        <Button title="Sign up" onPress={() => router.push('/signup')} />
        <Button title="Log in" variant="secondary" onPress={() => router.push('/login')} />
        <Button title="Continue as guest" variant="ghost" onPress={() => router.replace('/home')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { marginTop: 'auto', gap: 12 },
});
