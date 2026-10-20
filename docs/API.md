# API

Hono on Cloudflare Workers. Types come from `packages/shared` (`@visus/shared`).

- Local: `http://localhost:8787` (phone: `bunx wrangler dev --ip 0.0.0.0`, then use your Mac's Wi-Fi IP)
- Auth: send `Authorization: Bearer <token>` on every route except `/health`, `/auth/signup`, `/auth/login`
- Errors: `{ "error": "message" }` with a 4xx/5xx status

**D** = Dhrutinandan, **T** = Teammate. Status: planned → mock (apps use mock data) → live.

| Route | Request | Response | Owner | Status |
|---|---|---|---|---|
| `GET /health` | — | `{ ok: true }` | D | planned |
| `POST /auth/signup` | `SignupRequest` | `AuthResponse` | D | planned |
| `POST /auth/login` | `LoginRequest` | `AuthResponse` | D | planned |
| `GET /me` | — | user + `Profile[]` | D | planned |
| `POST /profiles` | `Profile` without `id` | `Profile` | D | planned |
| `PATCH /profiles/:id` | partial `Profile` | `Profile` | D | planned |
| `POST /sessions` | `CreateSessionRequest` | `CreateSessionResponse` | D | planned |
| `POST /sessions/:id/results` | `SubmitResult` | `NextStep` | D (route) + T (scoring, rules) | planned |
| `POST /sessions/:id/verdict` | — | `Verdict` | D (route) + T (lens) | planned |
| `GET /sessions` | — | list: id, date, mode, headline, overall status | T | planned |
| `GET /sessions/:id` | — | `Verdict` | T | planned |
| `POST /sessions/:id/share` | — | `{ url, expiresAt }` | T | planned |

## How `POST /sessions/:id/results` works

1. Validate `SubmitResult`.
2. `scoring/` turns raw answers into a `ScoredResult` (T).
3. Save the result.
4. `rules/` checks for a red flag, then for an obvious next test (T).
5. If the rules can't decide, `agent/` asks Gemini to re-plan, choosing only from `TEST_CATALOG` (D).
6. Return `NextStep`.

## Answers format per test

Each test screen sends `answers` in the shape its scorer expects. Write the shape here when the scorer is built:

| Test | `answers` shape |
|---|---|
| `tumbling_e` | _tbd_ |
| `clock_dial` | _tbd_ |
| `amsler` | _tbd_ |
| `contrast` | _tbd_ |
