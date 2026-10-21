// Teammate. GET /sessions, GET /sessions/:id, POST /sessions/:id/share
import { Hono } from 'hono';
import type { AppEnv } from '../../lib/env';

export const historyRoutes = new Hono<AppEnv>();
