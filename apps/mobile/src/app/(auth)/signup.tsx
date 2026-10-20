import { router } from 'expo-router';

import { Button } from '@/components/Button';
import { Placeholder } from '@/components/Placeholder';
import { Screen } from '@/components/Screen';

export default function Signup() {
  return (
    <Screen title="Sign up">
      <Placeholder screen="39. Sign up" />
      <Button title="Back" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
