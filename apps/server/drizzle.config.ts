// drizzle-kit (push / studio) runs on your Mac and reads DATABASE_URL from .dev.vars
// (or from the environment, e.g. a local test database).
import { existsSync, readFileSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

const vars = Object.fromEntries(
  (existsSync('.dev.vars') ? readFileSync('.dev.vars', 'utf8') : '')
    .split('\n')
    .filter((line) => line.includes('=') && !line.startsWith('#'))
    .map((line) => [line.slice(0, line.indexOf('=')).trim(), line.slice(line.indexOf('=') + 1).trim()]),
);
const url = new URL(process.env.DATABASE_URL ?? vars.DATABASE_URL);
const noSsl = url.searchParams.get('sslmode') === 'disable';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  // Aiven's own CA: TLS on, CA not checked (local admin tool only).
  dbCredentials: {
    host: url.hostname,
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    ssl: noSsl ? false : { rejectUnauthorized: false },
  },
});
