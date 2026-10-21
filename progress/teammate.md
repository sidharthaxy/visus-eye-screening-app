# Progress: Teammate

Area: web app + server (scoring, rules, lens, history). Claude updates this file at the end of every task. Newest entry on top.

## Now
- Web app (`apps/web`) on branch `feat/web`, built group by group from the design.

## Next
- Group 11: remaining tests (near reading, near point, duochrome, colour plates, kids tests, 3 questionnaires, peripheral)

## Blockers
- None

## Notes for Dhrutinandan / shared types
- Web services define two local types the server will need to return; worth moving into `packages/shared` when we agree:
  - `SessionListItem` + `History` (`GET /sessions`: past checks and trend values for the Results tab), in `apps/web/services/sessions.ts`.
  - `ProfileDetails` = `Profile` + `relation`, `specs` (glasses/contacts/both/neither), `pastEyeTest`, `screenTime` label and `prescription` (My glasses), in `apps/web/services/profiles.ts`.
- Eyes tested one at a time (`eachEye`) are sent as **one** `SubmitResult` with `eye: "both"` and `answers: { right: {...}, left: {...} }`.
- Added `zustand` and `@tanstack/react-query` to `apps/web` (updates root `bun.lock`).

## Log
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
