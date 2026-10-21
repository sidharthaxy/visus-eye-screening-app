import type { Auth, LoginInput, SignupInput } from '@/services/auth';

/** Any credentials work in mock mode. */
export function mockSignup(input: SignupInput): Auth {
  return {
    token: 'mock-token',
    user: { id: 'user-1', name: input.name.trim(), identifier: input.identifier.trim() },
  };
}

export function mockLogin(input: LoginInput): Auth {
  return {
    token: 'mock-token',
    user: { id: 'user-1', name: 'Asha Patel', identifier: input.identifier.trim() },
  };
}
