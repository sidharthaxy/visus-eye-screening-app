// Database connection (Postgres on Aiven; Hyperdrive in production).
// Workers can't share connections between requests, so each request gets its own pool,
// closed when the response is sent (see the middleware in index.ts).
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import type { Bindings } from '../lib/env';
import * as schema from './schema';

export function createDb(env: Bindings) {
  const hyperdrive = env.HYPERDRIVE?.connectionString;
  const pool = hyperdrive
    ? new Pool({ connectionString: hyperdrive, max: 5 })
    : new Pool({ ...directConnection(env.DATABASE_URL), max: 1 });
  return { db: drizzle(pool, { schema }), close: () => pool.end() };
}

export type Db = ReturnType<typeof createDb>['db'];

/**
 * Local dev talks to Aiven directly. Aiven signs its certificates with its own CA,
 * so TLS stays on but the CA isn't checked here. Production goes through Hyperdrive.
 */
export function directConnection(url: string) {
  const u = new URL(url);
  const noSsl = u.searchParams.get('sslmode') === 'disable'; // a Postgres on this Mac
  u.searchParams.delete('sslmode');
  return { connectionString: u.toString(), ssl: noSsl ? false : { rejectUnauthorized: false } };
}
