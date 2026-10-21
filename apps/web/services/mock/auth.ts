import type { AuthResult, User } from "../auth";
import { delay, load, save, uid } from "./store";

export async function signup(name: string, identifier: string): Promise<AuthResult> {
  await delay();
  const user: User = { id: uid(), name, identifier };
  save("user", user);
  return { token: "mock-" + user.id, user };
}

export async function login(identifier: string): Promise<AuthResult> {
  await delay();
  const user = load<User | null>("user", null) ?? { id: "u1", name: "Asha Sharma", identifier };
  save("user", user);
  return { token: "mock-" + user.id, user };
}

export async function me(): Promise<User | null> {
  await delay(100);
  return load<User | null>("user", null);
}
