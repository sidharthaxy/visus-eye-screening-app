import type { AuthResult, User } from "../auth";
import { doctorAccount } from "./consults";
import { list } from "./profiles";
import { delay, load, save, uid } from "./store";

export async function signup(name: string, identifier: string): Promise<AuthResult> {
  await delay();
  const user: User = { id: uid(), name, identifier };
  save("user", user);
  return { token: "mock-" + user.id, user };
}

export async function login(identifier: string): Promise<AuthResult> {
  await delay();
  // A login with "doctor" in it signs in as the mock doctor (registered here, else the demo doctor).
  if (/doctor/i.test(identifier)) {
    const doc = doctorAccount();
    const user: User = { id: doc.id, name: doc.name, identifier, role: "doctor", visusId: doc.visusId };
    save("user", user);
    return { token: "mock-" + user.id, user };
  }
  const user = load<User | null>("user", null) ?? { id: "u1", name: "Asha Sharma", identifier };
  save("user", user);
  return { token: "mock-" + user.id, user };
}

export async function me() {
  const user = load<User | null>("user", null) ?? { id: "u1", name: "Asha Sharma", identifier: "asha@example.com" };
  return { user, profiles: await list() };
}
