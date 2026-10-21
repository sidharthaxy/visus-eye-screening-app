import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Auth, User } from '@/services/auth';
import { phoneStorage } from '@/store/storage';

type AuthState = {
  token: string | null;
  user: User | null;
  signIn: (auth: Auth) => void;
  signOut: () => void;
};

/** The signed-in account. Kept on the phone, so the app stays logged in after a restart. */
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      signIn: (auth) => set({ token: auth.token, user: auth.user }),
      signOut: () => set({ token: null, user: null }),
    }),
    { name: 'visus-auth', storage: phoneStorage, partialize: ({ token, user }) => ({ token, user }) },
  ),
);
