// POST /auth/signup, POST /auth/login, GET /me
import { Hono } from 'hono';
import type { AppEnv } from '../../lib/env';

export const authRoutes = new Hono<AppEnv>();
