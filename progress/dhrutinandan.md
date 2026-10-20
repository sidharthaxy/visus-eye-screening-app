# Progress: Dhrutinandan

Area: mobile app + server (setup, auth, agent). Claude updates this file at the end of every task. Newest entry on top.

## Now
- Mobile foundation done (`feat/mobile-foundation`), ready for a PR

## Next
- Phase 1 mobile screens on mock data: Welcome, Sign up, Log in, Onboarding (`WORK.md`)

## Blockers
- Design accent shades (`accSoft`, `accInk`, `accBright`) and a few sizes (button height 56, chip height 44, hero 40) are slider settings in the Claude Design file. They were in the part of the file the design tool could not read (it reads only the first 256 KiB), so they are derived from the brand blue `#2F6FD6`. Check them against the design and fix in `apps/mobile/src/constants/theme.ts`.
- The final design file `Visus Eye Care App.html` (and its images) are over that limit and could not be copied into `design/`. Download it from Claude Design and save as `design/visus-design-handoff.html` (see `design/README.md`). The foundation was built from the earlier source file (screens 1–56, tests 26–29), which the project no longer has.
- Not checked on a device yet: no EAS project ID and no simulator. The Android bundle builds cleanly in Metro.

## Log
- 2026-10-21: Exported the readable Claude Design files to `design/claude-design/` (style rules, runtime) and documented the missing full export in `design/README.md`.
- 2026-10-21: Mobile foundation (`feat/mobile-foundation`). Theme in `src/constants/theme.ts` (colours, status colours, Figtree, spacing, radius, sizes, type). Components: Button, Card, Chip/StatusBadge/Pill, ListRow, TestHeader, BottomTabBar (floating pill), Icon (design SVGs), Screen, Placeholder. Routes: `index` → `/welcome`, `(auth)` welcome/signup/login, `(tabs)` home/tests/results/profile as placeholders. `services/api.ts` (request helper, `USE_MOCK`, `mockDelay`) + empty `services/mock/`. Removed Expo template screens, components, hooks and assets. Added `react-native-svg`, `@expo-google-fonts/figtree`, ESLint config. App set to light mode only.
