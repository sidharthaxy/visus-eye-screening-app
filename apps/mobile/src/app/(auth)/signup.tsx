import { router } from 'expo-router';

import { Placeholder } from '@/components/Placeholder';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function Signup() {
  return (
    <Screen>
      <ScreenHeader left="back" onLeft={() => router.back()} title="Sign up" />
      <Placeholder screen="39. Sign up" />
    </Screen>
  );
}
