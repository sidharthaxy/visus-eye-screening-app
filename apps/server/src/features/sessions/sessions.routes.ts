// POST /sessions, POST /sessions/:id/results, POST /sessions/:id/verdict
import { Hono } from 'hono';
import type { AppEnv } from '../../lib/env';

export const sessionsRoutes = new Hono<AppEnv>();
