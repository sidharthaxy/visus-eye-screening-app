# Progress: Dhrutinandan

Area: mobile app + server (setup, auth, agent). Claude updates this file at the end of every task. Newest entry on top.

## Now
- Group 1 (`feat/mobile-auth`) built, waiting for phone check: Welcome, Sign up, Log in, Onboarding

## Next
- Group 2 (`feat/mobile-home`): Home, Tests library, Test detail
- Wire `TextSizes.large` in when Settings → Text size is built

## Notes for Dhrutinandan
- Onboarding "Past eye tests" (+ note) has no field in the shared `Profile` type, so it shows in the summary but is not saved. Adding it (e.g. `pastEyeTest`, `pastEyeNote`) needs both of you.
- The login token is in memory only: after an app restart you are a guest again. Persisting it needs `expo-secure-store` (works in Expo Go); ask before adding.
- "Start my first eye check" (onboarding) and "Continue as guest" go to Home until Issue intake (group 3) and Permissions exist.
- Mock auth accepts any credentials.

## Blockers
- None. Checked by typecheck, lint and a full Android bundle build in Metro; not yet on a device.

## Log
- 2026-10-21: Group 1 auth screens (`feat/mobile-auth`). Sign up (39) with live password hints, Log in (40), Onboarding (2: 7 steps + summary, saves a `Profile` via `createProfile`). New shared components: `TextField` (label, focus ring, password toggle, hint), `OptionRow` (radio answer card), `FormScreen` (keyboard-aware scroll page). Services: `auth.ts` (signup, login, currentUser), `profiles.ts` (createProfile) with mocks in `services/mock/`. Icons: eyeOff, check, checkLarge, minus, plusBold. Button disabled opacity 0.35 as in the design.
- 2026-10-21: Matched the foundation to the final design (`design/visus-screens-unpacked.html`). Theme: confirmed Ocean accent (`#3C7EBE` / `#E0F1FF` / `#194F81` / `#7ABDFF`), hero 38px, `TextSizes.normal` + `TextSizes.large`, `Type.option`, `borderOption #E4E4E0`. Components: new `ScreenHeader` + `HeaderButton` (back/close bar used on every non-tab screen), `TestHeader` built on it; Chip uses 17/500 with `#E4E4E0` border, family-chip style with `ChipAvatar`; `Pill` sizes sm/md; Icon keeps each design viewBox so strokes match; tab bar sits 26px from the bottom, tab screens leave 112px. Welcome screen built with `assets/images/visus-eye.png` (copy fix: "Tests run on your phone."). Committed the design export in `design/`.
- 2026-10-21: Exported the readable Claude Design files to `design/claude-design/` (style rules, runtime) and documented the missing full export in `design/README.md`.
- 2026-10-21: Mobile foundation (`feat/mobile-foundation`). Theme in `src/constants/theme.ts` (colours, status colours, Figtree, spacing, radius, sizes, type). Components: Button, Card, Chip/StatusBadge/Pill, ListRow, TestHeader, BottomTabBar (floating pill), Icon (design SVGs), Screen, Placeholder. Routes: `index` → `/welcome`, `(auth)` welcome/signup/login, `(tabs)` home/tests/results/profile as placeholders. `services/api.ts` (request helper, `USE_MOCK`, `mockDelay`) + empty `services/mock/`. Removed Expo template screens, components, hooks and assets. Added `react-native-svg`, `@expo-google-fonts/figtree`, ESLint config. App set to light mode only.
