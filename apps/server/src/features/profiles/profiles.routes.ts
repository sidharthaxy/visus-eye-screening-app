// GET /profiles, POST /profiles, PATCH /profiles/:id
import { Hono } from 'hono';
import type { AppEnv } from '../../lib/env';

export const profilesRoutes = new Hono<AppEnv>();
