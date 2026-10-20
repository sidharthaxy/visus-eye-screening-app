# apps/server: Hono on Cloudflare Workers

Shared by both. Read the root `CLAUDE.md` and `docs/API.md` first.

> **Dhrutinandan writes his part by hand.** In his folders, Claude explains, reviews and suggests fixes, and only writes larger code when he asks directly.

## Stack

- Hono on Cloudflare Workers (`wrangler.jsonc`, `nodejs_compat` on), TypeScript
- Postgres on Aiven, via Cloudflare Hyperdrive in production; Drizzle ORM + `pg`
- `zod` + `@hono/zod-validator`, types from `@visus/shared`
- Auth: phone/email + password (PBKDF2 via Web Crypto), JWT via `hono/jwt`
- Gemini (Google AI Studio API) for the agent

## Who owns which folder

| Folder | What | Owner |
|---|---|---|
| `src/index.ts` | App setup, middleware, mounting routes | Dhrutinandan |
| `src/db/` | Drizzle schema, migrations, DB client | Dhrutinandan |
| `src/auth/` | Signup, login, JWT middleware | Dhrutinandan |
| `src/routes/sessions.ts`, `src/routes/profiles.ts` | Check session + profile routes | Dhrutinandan |
| `src/agent/`, `src/prompts/` | Gemini plan / re-plan / verdict, system prompts | Dhrutinandan |
| `src/scoring/` | One scorer per test: raw answers → `ScoredResult` | Teammate |
| `src/rules/` | Red flags + simple next-test rules | Teammate |
| `src/lens/` | ZEISS lens catalog + recommendation | Teammate |
| `src/routes/history.ts` | `GET /sessions`, `GET /sessions/:id`, share link | Teammate |

The DB schema has one owner (Dhrutinandan). Teammate asks for new columns instead of editing it.

## Rules

- Rules first, AI second: red flags and obvious next tests come from `src/rules/`; Gemini only plans, re-plans unclear cases and writes the verdict text.
- Gemini returns JSON, validated with the shared zod schema; on failure fall back to the rule-based plan.
- The AI only picks tests from `TEST_CATALOG`.
- Prompts are TypeScript string exports in `src/prompts/` (Workers can't read files at runtime).
- When you add or change a route, update `docs/API.md` in the same PR.

## Secrets and running

- Local secrets in `.dev.vars` (gitignored): `DATABASE_URL`, `GEMINI_API_KEY`, `JWT_SECRET`, `PASSWORD_PEPPER`. Production: `bunx wrangler secret put <NAME>`.
- `bun run dev` → `http://localhost:8787`. For the phone: `bunx wrangler dev --ip 0.0.0.0`.
- Free Workers have a small CPU budget: test signup/login on the deployed Worker early.
