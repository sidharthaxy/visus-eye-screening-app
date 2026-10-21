# Progress: Dhrutinandan

Area: mobile app + server (setup, auth, agent). Claude updates this file at the end of every task. Newest entry on top.

## Now
- Group 3 (`feat/mobile-check-start`) built, waiting for phone check: Issue intake, Your test plan, Screen calibration, Test instructions

## Next
- Group 4 (`feat/mobile-tests`): Tumbling E, Clock dial, Amsler, Contrast + `/check/[testId]/run`. Wire "I'm ready" (instructions) there.
- Wire `TextSizes.large` in when Settings → Text size is built

## Notes for Dhrutinandan
- Onboarding "Past eye tests" (+ note) has no field in the shared `Profile` type, so it shows in the summary but is not saved. Adding it (e.g. `pastEyeTest`, `pastEyeNote`) needs both of you.
- The login token is in memory only: after an app restart you are a guest again. Persisting it needs `expo-secure-store` (works in Expo Go); ask before adding.
- No guest mode: every user needs an account ("Continue as guest" removed from Welcome and Log in). Screens can assume `currentUser()` is set.
- "Start my first eye check" (onboarding) goes to Home until Issue intake (group 3) exists.
- Mock auth accepts any credentials.
- Test detail text for 13 of the 14 tests is written by Claude (the design only has Distance acuity). It lives in `apps/mobile/src/constants/tests.ts`; edit freely. Non-E tests show their category icon as the illustration.
- `SessionSummary` (one row of `GET /sessions`) is defined in `services/sessions.ts` because `@visus/shared` has no type for it yet. Teammate owns that route: move it to shared when it's built.
- Home buttons not wired yet: quick check "Start" (→ Quick check, Phase 2), Screen time card (→ Screen Coach, Phase 3, mock numbers for now).
- Calibration shows the bank card upright (short edge, 53.98 mm, across the screen): the design's sideways card can't be matched at real size because 85.6 mm is wider than a phone. `pxPerMm = card width in points / 53.98`. Kept in memory only, so it is asked again after an app restart (persisting needs a storage library). Face-distance check with the camera is Phase 3.
- Intake follow-up questions (eyes, how long, pain/flashes) are fixed in the app; the answers go to the server as part of `intake` text (`Eyes: …`, `How long: …`, `Pain, redness or flashes: …`). "Yes, flashes" is not treated as a red flag in the app: red flags come from server rules.
- Instructions text for all 14 tests is in `constants/tests.ts` (`INSTRUCTIONS`). Distance acuity follows the design; the rest are written by Claude. Note: the design's Tumbling E test screen says "Phone placed 2 m away · helper answers" but its instructions say arm's length (40 cm); group 4 will follow the instructions (40 cm, user answers).
- Added `zustand` (stores in `src/store/`) and `expo-speech` (Listen on instructions), both Expo Go.

## Blockers
- None. Checked by typecheck, lint and a full Android bundle build in Metro; not yet on a device.

## Log
- 2026-10-21: Group 3 (`feat/mobile-check-start`). Issue intake (9): chat with greeting, 3 follow-up questions with chips, typing bubble, `createSession` → "See my test plan". Your test plan (10): plan rows with reasons, Before you start pills, Begin → calibration (if needed) or instructions. Screen calibration (11): upright bank card, slider + −/+, saves `pxPerMm`. Test instructions (13): `TestArt`, title, steps, tip, Listen (expo-speech, highlights the step being read). Stores `store/check.ts` (`firstStep()`) and `store/calibration.ts`. New components `Slider`, `TestArt`; `Pill` size `tall`. Home "Start eye check", Onboarding "Start my first eye check" and Test detail "Start test" (single-test session) now start the flow. Root layout wrapped in `GestureHandlerRootView`.
- 2026-10-21: Group 2 fix: Home header shows only the day and date ("Today" title removed).
- 2026-10-21: Group 2 (`feat/mobile-home`). Home (3): date + Today, dark "Due today" card, quick check row, screen time + last check tiles, popular tests. Tests (4): 6 category tiles + numbered list from `TEST_CATALOG`. Test detail (8, `/tests/[testId]`): E-chart or category icon, Time / For / Eyes, What it checks, Who it's for. Added `constants/tests.ts` (category + per-test copy), `services/sessions.ts` (listSessions) and `services/coach.ts` (mock screen time), category icons, `ListRow.minHeight`.
- 2026-10-21: Group 1 fixes: removed guest mode (Welcome, Log in); Welcome illustration larger (up to 360px), heading 32px and body 16px, "Tests run on your phone" pill removed; onboarding summary has no tick circle, only "All done".
- 2026-10-21: Group 1 auth screens (`feat/mobile-auth`). Sign up (39) with live password hints, Log in (40), Onboarding (2: 7 steps + summary, saves a `Profile` via `createProfile`). New shared components: `TextField` (label, focus ring, password toggle, hint), `OptionRow` (radio answer card), `FormScreen` (keyboard-aware scroll page). Services: `auth.ts` (signup, login, currentUser), `profiles.ts` (createProfile) with mocks in `services/mock/`. Icons: eyeOff, check, checkLarge, minus, plusBold. Button disabled opacity 0.35 as in the design.
- 2026-10-21: Matched the foundation to the final design (`design/visus-screens-unpacked.html`). Theme: confirmed Ocean accent (`#3C7EBE` / `#E0F1FF` / `#194F81` / `#7ABDFF`), hero 38px, `TextSizes.normal` + `TextSizes.large`, `Type.option`, `borderOption #E4E4E0`. Components: new `ScreenHeader` + `HeaderButton` (back/close bar used on every non-tab screen), `TestHeader` built on it; Chip uses 17/500 with `#E4E4E0` border, family-chip style with `ChipAvatar`; `Pill` sizes sm/md; Icon keeps each design viewBox so strokes match; tab bar sits 26px from the bottom, tab screens leave 112px. Welcome screen built with `assets/images/visus-eye.png` (copy fix: "Tests run on your phone."). Committed the design export in `design/`.
- 2026-10-21: Exported the readable Claude Design files to `design/claude-design/` (style rules, runtime) and documented the missing full export in `design/README.md`.
- 2026-10-21: Mobile foundation (`feat/mobile-foundation`). Theme in `src/constants/theme.ts` (colours, status colours, Figtree, spacing, radius, sizes, type). Components: Button, Card, Chip/StatusBadge/Pill, ListRow, TestHeader, BottomTabBar (floating pill), Icon (design SVGs), Screen, Placeholder. Routes: `index` → `/welcome`, `(auth)` welcome/signup/login, `(tabs)` home/tests/results/profile as placeholders. `services/api.ts` (request helper, `USE_MOCK`, `mockDelay`) + empty `services/mock/`. Removed Expo template screens, components, hooks and assets. Added `react-native-svg`, `@expo-google-fonts/figtree`, ESLint config. App set to light mode only.
