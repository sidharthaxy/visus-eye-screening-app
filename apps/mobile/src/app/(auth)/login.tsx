import { router } from 'expo-router';

import { Button } from '@/components/Button';
import { Placeholder } from '@/components/Placeholder';
import { Screen } from '@/components/Screen';

export default function Login() {
  return (
    <Screen title="Log in">
      <Placeholder screen="40. Log in" />
      <Button title="Back" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
