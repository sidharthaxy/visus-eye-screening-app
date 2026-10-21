import { Figtree_400Regular } from '@expo-google-fonts/figtree/400Regular';
import { Figtree_500Medium } from '@expo-google-fonts/figtree/500Medium';
import { Figtree_600SemiBold } from '@expo-google-fonts/figtree/600SemiBold';
import { Figtree_700Bold } from '@expo-google-fonts/figtree/700Bold';
import { useFonts } from 'expo-font';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ErrorState } from '@/components/ErrorState';
import { Screen } from '@/components/Screen';
import { Colors } from '@/constants/theme';
import { useHydrated } from '@/store/hydration';
import { useOfflineSync } from '@/store/offlineSync';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold });
  // Login, settings and calibration are read from the phone before the first screen.
  const hydrated = useHydrated();
  const ready = (loaded || !!error) && hydrated;
  useOfflineSync();

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }} />
    </GestureHandlerRootView>
  );
}

/** A crash anywhere shows the Error screen (55) instead of a red box. */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <Screen>
      <ErrorState onRetry={retry} body="This page stopped working. Try again, or go back to Home. Your saved checks are safe." />
    </Screen>
  );
}
