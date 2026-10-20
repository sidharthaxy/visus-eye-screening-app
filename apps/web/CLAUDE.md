@AGENTS.md

# apps/web: Next.js app

Owner: Teammate. Read the root `CLAUDE.md` first.

## Stack

- Next.js (App Router, routes in `app/`), TypeScript, Tailwind CSS
- SVG / Canvas for drawing tests
- `zustand` for check state, `@tanstack/react-query` for server data
- `@visus/shared` for types and the test catalog (already in `transpilePackages`)
- Build sprint: `@mediapipe/tasks-vision` for camera distance

## Look and layout

- Same screens and routes as mobile (`docs/SCREENS.md`), matching the Claude Design handoff.
- Mobile-first: full screen on phones; on a laptop, centred in a phone-sized frame (max width ~430 px).
- Leave out mobile-only features: Screen Coach screens and the Home screen-time card.

## Layout

```
app/            routes, exactly as in docs/SCREENS.md
components/     shared UI
services/       api.ts + one file per server area (auth, sessions, profiles)
  mock/         mock data until the server route is live
tests/          one component per test, keyed by TestId
store/          zustand stores (current check, calibration)
```

## Rules

- Pages use `services/*`. Never `fetch` in a page, never import from `mock/` in a page.
- Tests only collect raw answers and send them; the server scores.
- Test sizes come from `pxPerMm` in the calibration store.
- Login token in `localStorage`, sent as `Authorization: Bearer <token>`.
- Ask users to set screen brightness to full before visual tests.
- Camera needs HTTPS on phones: test camera features on the Vercel preview URL.
