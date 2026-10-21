// POST /sessions, POST /sessions/:id/results, POST /sessions/:id/verdict
import { CreateSessionRequest, SubmitResult } from '@visus/shared';
import { Hono } from 'hono';

import type { AppEnv } from '../../lib/env';
import { validate } from '../../lib/validate';
import { requireAuth } from '../auth/auth.middleware';
import { createSession, createVerdict, submitResult } from './sessions.service';

export const sessionsRoutes = new Hono<AppEnv>();
sessionsRoutes.use('*', requireAuth);

sessionsRoutes.post('/', validate('json', CreateSessionRequest), async (c) =>
  c.json(await createSession(c.var.db, c.env, c.var.userId, c.req.valid('json')), 201),
);

sessionsRoutes.post('/:id/results', validate('json', SubmitResult), async (c) =>
  c.json(await submitResult(c.var.db, c.env, c.var.userId, c.req.param('id'), c.req.valid('json'))),
);

sessionsRoutes.post('/:id/verdict', async (c) => c.json(await createVerdict(c.var.db, c.env, c.var.userId, c.req.param('id'))));
