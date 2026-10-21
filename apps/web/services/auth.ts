import { api, setToken, USE_MOCK } from "./api";
import * as mock from "./mock/auth";

export type User = { id: string; name: string; identifier: string };
export type AuthResult = { token: string; user: User };

export async function signup(input: { name: string; identifier: string; password: string }): Promise<User> {
  const res = USE_MOCK ? await mock.signup(input.name, input.identifier) : await api<AuthResult>("/auth/signup", { body: input });
  setToken(res.token);
  return res.user;
}

export async function login(input: { identifier: string; password: string }): Promise<User> {
  const res = USE_MOCK ? await mock.login(input.identifier) : await api<AuthResult>("/auth/login", { body: input });
  setToken(res.token);
  return res.user;
}

export async function me(): Promise<User | null> {
  if (USE_MOCK) return mock.me();
  return api<{ user: User }>("/me").then((r) => r.user);
}

export function logout() {
  setToken(null);
}
