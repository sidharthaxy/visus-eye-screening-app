// App setup: CORS, error handler, health check, feature routers.
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { authRoutes } from './features/auth/auth.routes';
import { historyRoutes } from './features/history/history.routes';
import { profilesRoutes } from './features/profiles/profiles.routes';
import { sessionsRoutes } from './features/sessions/sessions.routes';
import type { AppEnv } from './lib/env';
import { errorHandler } from './lib/errors';

const app = new Hono<AppEnv>();

// Browsers only: the web app on localhost and Vercel. The phone app doesn't need CORS.
const ALLOWED = [/^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/, /^https:\/\/[a-z0-9-]+\.vercel\.app$/];
app.use(
  '*',
  cors({
    origin: (origin) => (ALLOWED.some((re) => re.test(origin)) ? origin : null),
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  }),
);

app.get('/health', (c) => c.json({ ok: true }));

app.route('/', authRoutes); // /auth/signup, /auth/login, /me
app.route('/profiles', profilesRoutes);
app.route('/sessions', sessionsRoutes); // create, results, verdict
app.route('/sessions', historyRoutes); // list, one check, share

app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError(errorHandler);

export default app;
