// Verify the Bearer JWT and set c.var.userId. Used by protected routes.
import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';

import type { AppEnv } from '../../lib/env';
import { fail } from '../../lib/errors';

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) fail(401, 'Please log in.');
  const payload = await verify(token, c.env.JWT_SECRET, 'HS256').catch(() => null);
  if (!payload || typeof payload.sub !== 'string') fail(401, 'Please log in again.');
  c.set('userId', payload.sub);
  await next();
});
