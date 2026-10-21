// Create a user, check login, load the current user.
import type { AuthResponse, LoginRequest, SignupRequest } from '@visus/shared';
import { eq } from 'drizzle-orm';
import { sign } from 'hono/jwt';
import type { z } from 'zod';

import type { Db } from '../../db/client';
import { users } from '../../db/schema';
import type { Bindings } from '../../lib/env';
import { fail } from '../../lib/errors';
import { hashPassword, verifyPassword } from './password';

const TOKEN_DAYS = 30;

/** Phone or email, compared without case or spaces. */
const normalize = (identifier: string) => identifier.trim().toLowerCase().replace(/\s+/g, '');

type User = typeof users.$inferSelect;
const publicUser = (u: User) => ({ id: u.id, name: u.name, identifier: u.identifier });

async function issue(env: Bindings, user: User): Promise<z.infer<typeof AuthResponse>> {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_DAYS * 86_400;
  const token = await sign({ sub: user.id, exp }, env.JWT_SECRET, 'HS256');
  return { token, user: publicUser(user) };
}

export async function signup(db: Db, env: Bindings, input: z.infer<typeof SignupRequest>) {
  const identifier = normalize(input.identifier);
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.identifier, identifier));
  if (existing) fail(409, 'An account with this phone or email already exists. Try logging in.');
  const passwordHash = await hashPassword(input.password, env.PASSWORD_PEPPER);
  const [user] = await db.insert(users).values({ name: input.name.trim(), identifier, passwordHash }).returning();
  return issue(env, user);
}

export async function login(db: Db, env: Bindings, input: z.infer<typeof LoginRequest>) {
  const [user] = await db.select().from(users).where(eq(users.identifier, normalize(input.identifier)));
  const ok = user && (await verifyPassword(input.password, env.PASSWORD_PEPPER, user.passwordHash));
  if (!ok) fail(401, 'Wrong phone, email or password.');
  return issue(env, user);
}

export async function getUser(db: Db, userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) fail(401, 'Please log in again.');
  return publicUser(user);
}
