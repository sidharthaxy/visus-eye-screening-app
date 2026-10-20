import { router } from 'expo-router';

import { Placeholder } from '@/components/Placeholder';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function Login() {
  return (
    <Screen>
      <ScreenHeader left="back" onLeft={() => router.back()} title="Log in" />
      <Placeholder screen="40. Log in" />
    </Screen>
  );
}
