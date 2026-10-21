# apps/server: Hono on Cloudflare Workers

Shared by both. Read the root `CLAUDE.md` and `docs/API.md` first.

> **Claude Code builds the server.** Follow the layout below, `docs/API.md` and the shared types in `@visus/shared`. Keep it simple: hackathon MVP.

## Stack

- Hono on Cloudflare Workers (`wrangler.jsonc`, `nodejs_compat` on), TypeScript
- Postgres on Aiven, via Cloudflare Hyperdrive in production; Drizzle ORM + `pg`
- `zod` + `@hono/zod-validator`, types from `@visus/shared`
- Auth: phone/email + password (PBKDF2 via Web Crypto), JWT via `hono/jwt`
- Gemini (Google AI Studio API) for the agent

## Layout (feature-first) and owners

Each feature folder holds its own routes, logic and queries. Own whole folders, never edit the other person's.

```
src/
  index.ts                  app setup: CORS, error handler, mounts feature routers   Dhrutinandan
  db/schema.ts, client.ts   all tables (Drizzle) + DB connection                     Dhrutinandan
  lib/                      env types, errors, Gemini client                         Dhrutinandan
  features/
    auth/                   signup, login, /me, password hashing, JWT middleware     Dhrutinandan
    profiles/               profiles, family members, glasses                        Dhrutinandan
    sessions/               POST /sessions, /results, /verdict: ties features together  Dhrutinandan
    agent/                  Gemini plan / re-plan / verdict + prompts                Dhrutinandan
    scoring/                one scorer per test: answers → ScoredResult             Teammate
    rules/                  red flags + simple next-test rules                       Teammate
    lens/                   ZEISS lens catalog + recommendation                      Teammate
    history/                GET /sessions, GET /sessions/:id, share link             Teammate
```

- Features with routes export a Hono router (`authRoutes`, `profilesRoutes`, `sessionsRoutes`, `historyRoutes`); `index.ts` mounts them, e.g. `app.route('/auth', authRoutes)`.
- `agent`, `scoring`, `rules` and `lens` have no routes; `sessions` calls them.
- The DB schema has one owner (Dhrutinandan). Teammate asks for new tables or columns instead of editing it.

## Rules

- Rules first, AI second: red flags and obvious next tests come from `src/rules/`; Gemini only plans, re-plans unclear cases and writes the verdict text.
- Gemini returns JSON, validated with the shared zod schema; on failure fall back to the rule-based plan.
- The AI only picks tests from `TEST_CATALOG`.
- Prompts are TypeScript string exports in `src/features/agent/prompts.ts` (Workers can't read files at runtime).
- When you add or change a route, update `docs/API.md` in the same PR.

## Secrets and running

- Local secrets in `.dev.vars` (gitignored, copy from `.dev.vars.example`): `DATABASE_URL`, `GEMINI_API_KEY`, `JWT_SECRET`, `PASSWORD_PEPPER`. Production: `bunx wrangler secret put <NAME>`.
- `bun run dev` → `http://localhost:8787` on the local Workers runtime (needs `aiven-ca.pem`, below).
- `bun run dev:phone` → the same app on Bun (`src/local.ts`), on `0.0.0.0:8787` for the phone on your Wi-Fi. No CA file needed. Use this for local integration with the mobile app.
- Free Workers have a small CPU budget: test signup/login on the deployed Worker early.
- Aiven CA: download it (Aiven console → service → Connection information → CA certificate) to `apps/server/aiven-ca.pem` (gitignored). `bun run dev` trusts it via `NODE_EXTRA_CA_CERTS`; without it the local Worker can't open TLS to Aiven.
- Tables: `bun run db:push` (drizzle-kit reads `DATABASE_URL` from `.dev.vars`, or from the environment).
- Smoke test of every route: `bun run smoke` (server running), or `API=https://… bun run smoke` for the deployed Worker.
- Gemini models: `GEMINI_MODELS` in `src/lib/gemini.ts` (Flash-Lite first for speed, bigger Flash models as backup, 10 s budget, then rule fallbacks).
