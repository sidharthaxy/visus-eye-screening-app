# Progress: Sidhartha

Area: web app + server (scoring, rules, lens, history). Claude updates this file at the end of every task. Newest entry on top.

## Handover from Dhrutinandan (2026-10-22): read this first

**Status:** the server (all routes, AI agent) and the mobile app (all screens, real API, AI intake chat, camera distance, Screen Coach) are done and on `main`. The deployment (Workers + Hyperdrive, final APK) is Dhrutinandan's and comes later. **Everything else is yours** (`WORK.md` → Phase 3, "Sidhartha"). Nothing in Part 3 (native mobile) changes the API or the shared types, so the web needs nothing for it.

**Start here:**
1. `git pull` on `main`, `bun install` at the root.
2. Ask Dhrutinandan for the 4 server values → `apps/server/.dev.vars`.
3. `cd apps/server && bun run dev:phone` (API on `http://localhost:8787`), then `bun run smoke` in a second terminal: expect all checks to pass.
4. Work through "Your web tasks" below, in order. Tick `WORK.md` and log here as you go.

**Server (live locally, deploy coming):**
- Every route in `docs/API.md` is live: auth, profiles, AI intake chat, sessions (plan → results → verdict), history, share, public report. Smoke test: `cd apps/server && bun run smoke` (server running) — 37 checks.
- Run it: put the 4 values from Dhrutinandan in `apps/server/.dev.vars` (copy `.dev.vars.example`; never commit it), then `cd apps/server && bun run dev:phone` → `http://localhost:8787` (Bun, works with Aiven without a CA file). Tables already exist on Aiven.
- CORS allows `http://localhost:*` and `https://*.vercel.app`. For any other domain, ask Dhrutinandan to add it (`apps/server/src/index.ts`).
- The scorers already accept the web answer shapes (table "Web app shapes" in `docs/API.md`), including the web glasses result `{ glassesOff, glassesOn }`, whose summary is `"Right eye 20/40 → 20/20, left eye 20/50 → 20/20"`, and the peripheral `seen[24]` (index = ring × 8 + direction, 0 = up, clockwise). Each-eye summaries are `"Right eye X, left eye Y"`.
- `scoring/`, `rules/`, `lens/`, `history/` (your folders) were built by Claude for you. Thresholds per test: `docs/API.md` → "How each test is scored". Tune them after the accuracy check.

**Your web tasks, in order:**
1. **Real API:** set `NEXT_PUBLIC_API_URL=http://localhost:8787` and switch `apps/web/services/*` off mock. Replace the web-only types with the shared ones: `SessionListItem`/`History` → `SessionSummary` (`GET /sessions` returns `SessionSummary[]`, finished checks newest first, `scores` per test for the trend), `ProfileDetails` → `Profile` (`specs` → `eyewear`: glasses / contacts / both / none; `screenTime` label → `screenHoursPerDay` number; `prescription` is `{ right, left, updatedAt }` or `null` for "I don't know"). `GET /me` returns `{ user, profiles }`, owner first. Errors are `{ error }`; 401 = log in again.
2. **Intake chat:** replace the 3 scripted questions with `POST /intake/chat` (`IntakeChatRequest` → `IntakeChatResponse`, shared types). Send the whole chat each turn (greeting first); show `reply` + `chips`; when `done`, call `POST /sessions` with `intake` = one line per message, `Visus: …` / `Me: …`. Mobile reference: `apps/mobile/src/app/check/intake.tsx` + `services/sessions.ts` (`intakeChat`, `intakeText`).
3. **Report page `/r/[token]`:** `GET /reports/:token` (no login) returns the `Verdict`, 404 when the 24 h link expired. Share links are `WEB_URL/r/<token>`; send Dhrutinandan the Vercel URL so `WEB_URL` (`apps/server/wrangler.jsonc`) points there.
4. **Red flags / added tests:** after `red_flag`, continue with the next test in your plan; a `next_test` with `added: true` is inserted right after the current test (the server does the same).
5. Web camera distance (MediaPipe), Vercel deploy, accuracy check, demo video + presentation.

**Don't edit** `apps/mobile` or Dhrutinandan's server folders (`index.ts`, `db/`, `lib/`, `auth/`, `profiles/`, `sessions/`, `agent/`, `intake/`). Write what you need in your Blockers / Notes and he'll change it. `packages/shared`: add only, both approve.

## Now
- Web ↔ server integration done on `feat/web` (2026-10-22): every `services/*` call goes to the real API, shared types everywhere, AI intake chat, public report page `/r/[token]`. Checked in mock mode (tsc, lint, build, headless browser run); not yet run against the live server (see Blockers).

## Next
- Run the web against the local server once `.dev.vars` is filled: sign up → onboarding → full check → verdict → share → open `/r/<token>`.
- Web camera distance (MediaPipe in `apps/web/lib/useDistance.ts`).
- Vercel deploy; send Dhrutinandan the URL (`WEB_URL` for share links, CORS).

## Blockers
- `apps/server/.dev.vars` is missing locally: need the 4 values (DATABASE_URL, GEMINI_API_KEY, JWT_SECRET, PASSWORD_PEPPER) from Dhrutinandan.

## Notes for Dhrutinandan / shared types
- Eyes tested one at a time (`eachEye`) are sent as **one** `SubmitResult` with `eye: "both"` and `answers: { right: {...}, left: {...} }`.
- Added `zustand` and `@tanstack/react-query` to `apps/web` (updates root `bun.lock`).
- Summary formats the web reads for display (server should keep them): eachEye tests `"Right eye X, left eye Y"`; glasses check `"Right eye 20/40 → 20/20, left eye 20/50 → 20/20"`.
- Glasses check sends two `tumbling_e` results in a `mode: "glasses"` session, `answers.round` = `"glasses_off"` then `"glasses_on"`.
- Peripheral answers: `{ right: { seen: boolean[24], reactionMs, falseTaps }, left: … }`, point index = ring * 8 + direction (0 = up, clockwise).

## Web differences from the design
- Desktop layouts follow the responsive redesign canvas above (made in Claude Design from the mobile design's styles); phones keep the original mobile design.
- Tests on desktop use a wider centred column, not the canvas's side-panel layout.
- Tumbling E is sized for 2 m (the design's "placed 2 m away · helper answers"), so its instruction step 1 says 2 m instead of arm's length. Kids E is sized for 40 cm, as the Kids intro says.
- Calibration matches the card's short edge (a landscape card is wider than most phone screens).
- Web Permissions asks for the camera only (per `docs/SCREENS.md`), so it reads "One quick permission".
- Home has no screen-time card (mobile only); "Last eye check" is a full-width card.
- Tests tab has search + filter buttons in the header and a Glasses check entry (the design doesn't show where these open from).
- Result detail and single-test complete show the server's per-eye `eyes` (value, bar, detail) when sent, else values parsed from the summary.
- Results & analysis adds a "Lenses that suit you" link to screen 19.
- Copy fixes from `docs/SCREENS.md` applied (Entry, Analysing footer, About); About's title is "Your data and privacy". Analysing title while loading is "Analysing your answers" so it doesn't repeat the footer.
- Distance setup shows a live camera preview but doesn't measure yet; Near point asks the user for the distance until camera measuring lands.

## Log
- 2026-10-22: Synced `feat/web` with `main` (was 66 behind). Web on the real API:
  - `services/api.ts`: `NEXT_PUBLIC_API_URL` (default `http://localhost:8787`), `NEXT_PUBLIC_USE_MOCK=1` keeps the mocks, 30 s timeout, `{ error }` messages, 401 → log out and back to Welcome. `apps/web/.env.example` added.
  - Shared `Profile` / `SessionSummary` / `Verdict` replace the web-only types; `GET /me` for profiles; Results tab and Home trends from `GET /sessions` scores.
  - Intake chat on `POST /intake/chat`; `intake` sent as `Visus: …` / `Me: …` lines.
  - Glasses check sends two `tumbling_e` results (`round: "glasses_off"` / `"glasses_on"`), matching the server's two-round plan, instead of one `{ glassesOff, glassesOn }` result.
  - Added tests (`added: true`) are inserted right after the current test.
  - Result screens use `eyes`, `meaning`, `tip`, `field` (peripheral map) and the verdict's `date` / `minutes`.
  - Lens "Save" writes `savedLens` on the profile; Share report uses the check's owner and date.
  - New public page `/r/[token]` (`GET /reports/:token`, expired-link message on 404).
  - Guest mode removed (every route needs a login).
- 2026-10-21: Web is now a responsive website instead of a phone frame on desktop: top nav on desktop / bottom tab bar on phones, wide dashboard layouts for Welcome (landing page), Home, Tests (sidebar + card grid), Results tab, Profile and Results & analysis (lens column); intake gets a side panel; flows and tests sit in a centred column; sheets become centred cards on desktop. Redesign canvas: https://claude.ai/artifact/PUPUi2asuoXR8sN1k6CKYg (`feat/web`)
- 2026-10-21: Group 12 web: Quick check intro, Glasses check setup + two-round run + result, Re-check reminder over Home (when last check > 3 months, `?reminder=1` to preview, snooze a week). Offline and error states were built earlier (intake + shared ErrorState). (`feat/web`)
- 2026-10-21: Group 11 web: all 14 tests now render in the run screen: Near reading (N-sizes from pxPerMm, EN/HI/OR with Noto fonts), Near point (user enters the distance until camera measuring lands), Duochrome, Colour plates (12 dot plates generated like the design), Kids Tumbling E (stars, never says right/wrong) and Kids colour shapes, Eye risk / Eye strain / Glare questionnaires, Peripheral dot field (24 points, Space works, feeds the field map). (`feat/web`)
- 2026-10-21: Group 10 web: test-flow extras (switch eye with countdown, pause sheet, exit dialog were built with the run screen; Distance warning overlay is wired to `lib/useDistance.ts`, which returns null until MediaPipe lands), Test library filter sheet and search (search + filter buttons added to the Tests header). (`feat/web`)
- 2026-10-21: Group 9 web: Permissions (camera only on web, real browser prompt), Who is this check for (child → Kids mode intro), Kids mode intro, Distance setup (live front-camera preview; distance measuring comes with MediaPipe). Flow is now Onboarding → Permissions → Who → Intake, and Calibrate → Distance → Instructions. Mock gives child profiles the two kids tests. (`feat/web`)
- 2026-10-21: Group 8 web: Profile (family chips, glasses, last check, saved lens), Add family member, Edit profile, My glasses (prescription grid), Settings (text size → large-text mode, notifications, clear cache, log out), About (copy fix applied). Fixed a hydration mismatch for pages that read persisted stores. (`feat/web`)
- 2026-10-21: Group 7 web: Results tab (trend chart, past checks, empty state), Test result detail (+ peripheral field map, screen 58), Share report (real scannable QR from a small built-in encoder, Download PDF prints the report card, WhatsApp share), Single test complete. (`feat/web`)
- 2026-10-21: Group 6 web: Results & analysis (areas, findings, link to lens suggestions), Lens recommendation (best match + second lens, coatings). Phase 1 demo flow works end to end on mock data. (`feat/web`)
- 2026-10-21: Group 5 web: Between-test analysis (per-eye values when the summary is "Right eye X, left eye Y"), Red-flag alert (Find eye doctors opens Maps; Continue check goes to the next planned test), Analysing (`POST /sessions/:id/verdict`, copy fix applied). (`feat/web`)
- 2026-10-21: Group 4 web: test run screen (`/check/[testId]/run`) with Tumbling E (sized from pxPerMm for 2 m, arrow keys work), Clock dial, Amsler grid, Contrast; right eye → switch eye → left eye; pause sheet (Esc), exit dialog. Answers go to `submitResult`, no scoring in the app. (`feat/web`)
- 2026-10-21: Group 3 web: Issue intake chat (3 scripted follow-ups, then `POST /sessions`; offline fallback), Your test plan, Screen calibration (matches the card's short edge so it fits on phones; saves pxPerMm), Test instructions with Listen (browser speech). (`feat/web`)
- 2026-10-21: Group 2 web: Home (no screen-time card, Last eye check card is full width), Tests library with category tabs, Test detail for every test (preview art per test). (`feat/web`)
- 2026-10-21: Group 1 web: Welcome (copy fix applied), Sign up, Log in, Onboarding (7 steps + summary, creates the profile). Guest goes to Home. (`feat/web`)
- 2026-10-21: Group 0 web foundation: Tailwind theme tokens + large-text CSS variables, Figtree, shared components (Button, Card, Chip, StatusBadge, Pill, OptionRow, Toggle, Segmented, ListRow, ScreenHeader, TestHeader, TabBar, Screen), phone frame for laptops, all routes from `docs/SCREENS.md`, `services/api.ts` + auth/profiles/sessions with mocks, zustand stores (check, calibration, settings). (`feat/web`)
