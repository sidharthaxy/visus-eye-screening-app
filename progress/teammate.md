# Progress: Teammate

Area: web app + server (scoring, rules, lens, history). Claude updates this file at the end of every task. Newest entry on top.

## Now
- Web app (`apps/web`) on branch `feat/web`, built group by group from the design.

## Next
- Group 4: Tumbling E, Clock dial, Amsler, Contrast + the test run screen

## Blockers
- None

## Notes for Dhrutinandan / shared types
- Web services define two local types the server will need to return; worth moving into `packages/shared` when we agree:
  - `SessionListItem` + `History` (`GET /sessions`: past checks and trend values for the Results tab), in `apps/web/services/sessions.ts`.
  - `ProfileDetails` = `Profile` + `relation`, `specs` (glasses/contacts/both/neither), `pastEyeTest`, `screenTime` label and `prescription` (My glasses), in `apps/web/services/profiles.ts`.
- Eyes tested one at a time (`eachEye`) are sent as **one** `SubmitResult` with `eye: "both"` and `answers: { right: {...}, left: {...} }`.
- Added `zustand` and `@tanstack/react-query` to `apps/web` (updates root `bun.lock`).

## Log
- 2026-10-21: Group 3 web: Issue intake chat (3 scripted follow-ups, then `POST /sessions`; offline fallback), Your test plan, Screen calibration (matches the card's short edge so it fits on phones; saves pxPerMm), Test instructions with Listen (browser speech). (`feat/web`)
- 2026-10-21: Group 2 web: Home (no screen-time card, Last eye check card is full width), Tests library with category tabs, Test detail for every test (preview art per test). (`feat/web`)
- 2026-10-21: Group 1 web: Welcome (copy fix applied), Sign up, Log in, Onboarding (7 steps + summary, creates the profile). Guest goes to Home. (`feat/web`)
- 2026-10-21: Group 0 web foundation: Tailwind theme tokens + large-text CSS variables, Figtree, shared components (Button, Card, Chip, StatusBadge, Pill, OptionRow, Toggle, Segmented, ListRow, ScreenHeader, TestHeader, TabBar, Screen), phone frame for laptops, all routes from `docs/SCREENS.md`, `services/api.ts` + auth/profiles/sessions with mocks, zustand stores (check, calibration, settings). (`feat/web`)
