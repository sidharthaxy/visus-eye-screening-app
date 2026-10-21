import type { AuthResponse, LoginRequest, SignupRequest } from '@visus/shared';

import { mockDelay, request, setToken, USE_MOCK } from '@/services/api';
import { mockLogin, mockSignup } from '@/services/mock/auth';

export type Auth = ReturnType<typeof AuthResponse.parse>;
export type User = Auth['user'];
export type SignupInput = ReturnType<typeof SignupRequest.parse>;
export type LoginInput = ReturnType<typeof LoginRequest.parse>;

// Kept in memory for now: logging in again is needed after an app restart.
let user: User | null = null;

function start(auth: Auth) {
  setToken(auth.token);
  user = auth.user;
  return auth.user;
}

/** POST /auth/signup */
export async function signup(input: SignupInput): Promise<User> {
  const auth = USE_MOCK ? await mockDelay(mockSignup(input)) : await request<Auth>('/auth/signup', { method: 'POST', body: input });
  return start(auth);
}

/** POST /auth/login */
export async function login(input: LoginInput): Promise<User> {
  const auth = USE_MOCK ? await mockDelay(mockLogin(input)) : await request<Auth>('/auth/login', { method: 'POST', body: input });
  return start(auth);
}

/** The signed-in user, or null for guests. */
export function currentUser() {
  return user;
}
