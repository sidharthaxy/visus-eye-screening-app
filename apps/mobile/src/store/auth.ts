import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Auth, User } from '@/services/auth';

type AuthState = {
  token: string | null;
  user: User | null;
  signIn: (auth: Auth) => void;
  signOut: () => void;
};

/** The login token is kept encrypted (Android Keystore / iOS Keychain). */
const secureStorage = createJSONStorage(() => ({
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}));

// Older builds kept the login in plain AsyncStorage: remove it.
AsyncStorage.removeItem('visus-auth').catch(() => undefined);

/** The signed-in account. Restored on app start, so the app stays logged in after a restart. */
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      signIn: (auth) => set({ token: auth.token, user: auth.user }),
      signOut: () => set({ token: null, user: null }),
    }),
    { name: 'visus-auth', storage: secureStorage, partialize: ({ token, user }) => ({ token, user }) },
  ),
);
