// GET /sessions, GET /sessions/:id, POST /sessions/:id/share; GET /reports/:token (public, for the web report page)
import { Hono } from 'hono';

import type { AppEnv } from '../../lib/env';
import { requireAuth } from '../auth/auth.middleware';
import { getSharedReport, getVerdict, listSessions, shareSession } from './history.service';

export const historyRoutes = new Hono<AppEnv>();
historyRoutes.use('*', requireAuth);

historyRoutes.get('/', async (c) => c.json(await listSessions(c.var.db, c.var.userId)));

historyRoutes.get('/:id', async (c) => c.json(await getVerdict(c.var.db, c.var.userId, c.req.param('id'))));

historyRoutes.post('/:id/share', async (c) =>
  c.json(await shareSession(c.var.db, c.var.userId, c.req.param('id'), c.env.WEB_URL ?? 'https://visus.app')),
);

export const reportRoutes = new Hono<AppEnv>();

reportRoutes.get('/:token', async (c) => c.json(await getSharedReport(c.var.db, c.req.param('token'))));
