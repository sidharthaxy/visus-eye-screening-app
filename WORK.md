# Work plan

Tick a task in the same PR that finishes it. **D** = Dhrutinandan, **T** = Teammate.

Key dates: idea submission **24 Oct** · shortlist **30 Oct** · build sprint **1–8 Nov**.

## Phase 0: setup (both)

- [x] D: Repo created, apps generated, pushed to GitHub
- [ ] D + T: Agree shared types in `packages/shared/src/index.ts`
- [ ] T: Vercel project connected (root `apps/web`)
- [ ] D: Cloudflare Workers Builds connected (root `apps/server`)
- [ ] D: Aiven Postgres created, `DATABASE_URL` in `apps/server/.dev.vars`

## Phase 1: core flow on mock data (by 23 Oct, for the demo video)

Mobile (D) and Web (T) each build these screens on mock data:

- [x] D [ ] T: Welcome, Sign up, Log in, Onboarding
- [x] D [ ] T: Home, Tests library, Test detail
- [x] D [ ] T: Issue intake → Your test plan → Calibration → Test instructions
- [x] D [ ] T: Tests: Tumbling E, Clock dial, Amsler grid, Contrast
- [x] D [ ] T: Between-test analysis, Red-flag alert, Analysing
- [x] D [ ] T: Results & analysis, Lens recommendation

Server:

- [ ] D: Hono setup, `GET /health`, CORS, error handling
- [ ] D: Database schema (Drizzle) + auth: signup, login, `GET /me`
- [ ] D: Agent: `POST /sessions` → AI test plan (Gemini)
- [ ] T: Scoring for Tumbling E, Clock dial, Amsler, Contrast
- [ ] T: Red-flag rules + simple next-test rules
- [ ] D: `POST /sessions/:id/results` wiring scoring + rules + AI re-plan
- [ ] T: Lens recommendation mapping
- [ ] D: `POST /sessions/:id/verdict`

## Phase 2: complete the app (24–30 Oct)

- [x] D [ ] T: Results tab, Test result detail (+ peripheral map), Single test complete, Share report
- [x] D [ ] T: Remaining screens: Profile, Family, Edit profile, My glasses, Settings, About
- [x] D [ ] T: Remaining tests: Near reading, Near point, Duochrome, Colour plates, Peripheral, Kids tests, 3 questionnaires
- [x] D [ ] T: Quick check, Glasses check, Who is this for, Kids intro, test-flow extras (switch eye, pause, exit), Permissions
- [ ] D [ ] T: Distance warning (47): needs camera distance tracking (Phase 3)
- [x] D [ ] T: States: offline, error, re-check reminder; Tests library filter and search
- [ ] D [ ] T: Switch services from mock to real API
- [ ] T: Scoring for remaining tests
- [ ] T: `GET /sessions`, `GET /sessions/:id`, share link
- [ ] D: Profiles: list, create, update

## Phase 3: build sprint (1–8 Nov, if shortlisted)

- [ ] D: Camera distance tracking (EAS development build)
- [ ] D: Screen Coach (Android native module + overlay)
- [ ] T: Web camera distance (MediaPipe)
- [ ] D + T: Accuracy check with 15–20 people
- [ ] D: Final APK (EAS) · T: Final Vercel deploy
- [ ] D + T: Demo video + presentation
