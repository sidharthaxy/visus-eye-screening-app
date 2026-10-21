# Visus

AI eye-screening app for the ZEISS BeyondCode'26 hackathon. Describe your eye problem, an AI agent picks vision tests, you take them on your phone, the agent re-plans after each test, and the check ends with results and a ZEISS lens suggestion. **Screening, not diagnosis.**

| Folder | What |
|---|---|
| `apps/mobile` | Expo app (Android), connected to the API (`EXPO_PUBLIC_USE_MOCK=1` for mock data) |
| `apps/web` | Next.js app |
| `apps/server` | Hono API on Cloudflare Workers, Postgres on Aiven, Gemini agent (all routes live, `bun run smoke`) |
| `packages/shared` | Shared zod types + test catalog |
| `docs/` | `API.md` (routes), `SCREENS.md` (screens → routes) |
| `design/` | Claude Design handoff |

Start with `CLAUDE.md` (rules, commands), `WORK.md` (task list) and `progress/` (status per person). Bun only: `bun install` at the root.
