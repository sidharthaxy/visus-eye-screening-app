# Visus

AI eye-screening app for the ZEISS BeyondCode'26 hackathon. The user describes their eye problem, an AI agent picks vision tests, the user takes them on their phone, the agent re-plans after each test, and the check ends with a verdict and a ZEISS lens suggestion. **Screening, not diagnosis.**

**This is a hackathon MVP.** Prefer the simplest thing that works. No extra abstractions, no new libraries without a clear reason, no over-engineering.

## Every session

1. Read this file, then your progress file in `progress/`.
2. Take the next unchecked task assigned to you in `WORK.md`.
3. Build it. Read the `CLAUDE.md` inside the folder you work in.
4. When done: tick it in `WORK.md`, update your progress file (done / next / blockers), commit.

## Repo map

| Folder | What | Owner |
|---|---|---|
| `apps/mobile/` | Expo SDK 57 app (Expo Router), deployed with EAS | Dhrutinandan |
| `apps/web/` | Next.js app, deployed on Vercel | Teammate |
| `apps/server/` | Hono API on Cloudflare Workers, Postgres on Aiven | Split by folder (see `apps/server/CLAUDE.md`) |
| `packages/shared/` | Shared zod types + test catalog. No logic | Both |
| `docs/API.md` | Every server route: owner, request, response | Both |
| `docs/SCREENS.md` | All 61 screens → routes, web vs mobile | Both |
| `design/` | Claude Design handoff | Dhrutinandan |
| `WORK.md` | Task list per person | Both |
| `progress/` | One progress file per person | Each person |

## How a check works

1. User types their problem → app calls `POST /sessions` → server (AI agent) returns a test plan.
2. App shows the test and collects **raw answers**. The app does not score.
3. App sends answers to `POST /sessions/:id/results` after **every** test. Server scores them, checks the rules, asks the AI only when the rules can't decide, and returns the next step: next test, red flag, or done.
4. App calls `POST /sessions/:id/verdict` → results + ZEISS lens suggestions.

All logic (scoring, rules, AI, lens) lives on the server. Apps are screens + test rendering.

## Rules

1. **Stay in your area.** Only edit folders owned by the person you are working for. If another area needs a change, write it down for them instead of editing.
2. **Shared types live in `packages/shared`.** Import them, never redefine them in an app. Changing them needs both people's approval.
3. **Screens never fetch directly.** Screens call `services/`. Until an endpoint is live, the service returns mock data from `services/mock/`. Switching to the real API must not touch screens.
4. **Same screens and routes on web and mobile** (`docs/SCREENS.md`). Native-only features (Screen Coach, screen-time card) are mobile only.
5. **Bun only** for installing and running (`bun add`, `bunx`). In `apps/mobile` use `bunx expo install <pkg>`. Never npm, yarn or pnpm.
6. **No secrets in apps.** Keys live only in `apps/server/.dev.vars` (local) and `wrangler secret` (production). Never read or print `.env` or `.dev.vars`.
7. **Test screens are clinical:** white background, black symbols, neutral font, no decoration. Symbol sizes come from screen calibration (pixels per mm).
8. **Wording:** always "screening, not diagnosis". Never claim "nothing is uploaded". Red flags come from server rules, not from the AI alone.
9. **Match the design** from Claude Design (`design/`). If a screen isn't covered, ask instead of inventing a new style.

## Git

- Never commit to `main`. Branch per task: `feat/<area>-<thing>` (e.g. `feat/mobile-home`, `feat/server-auth`).
- Commit messages: `feat(mobile): home screen`, `fix(server): login error`.
- Pull `main` daily: `git pull --rebase origin main`.
- `bun.lock` conflict: `git checkout origin/main -- bun.lock && bun install`, then commit.
- Merge through a pull request.

## Commands

| Task | Command |
|---|---|
| Install (repo root) | `bun install` |
| Mobile | `cd apps/mobile && bunx expo start` |
| Web | `cd apps/web && bun dev` |
| Server (local, phone on Wi-Fi) | `cd apps/server && bun run dev:phone` |
| Server smoke test (server running) | `cd apps/server && bun run smoke` |

## Deploy

| App | Where | How |
|---|---|---|
| Web | Vercel | Auto on push to `main` (root directory `apps/web`) |
| Server | Cloudflare Workers | Auto on push via Workers Builds (root `apps/server`), or `bunx wrangler deploy` |
| Mobile | Expo | Expo Go for screens; EAS development build for camera + Screen Coach; `bunx eas-cli build --profile preview --platform android` for the APK |
