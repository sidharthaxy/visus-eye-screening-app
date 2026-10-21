# Progress: Dhrutinandan

Area: mobile app + server (setup, auth, agent). Claude updates this file at the end of every task. Newest entry on top.

## Now
- Mobile foundation done and checked against the final design (`feat/mobile-foundation`), ready for a PR

## Next
- Phase 1 mobile screens on mock data: Sign up, Log in, Onboarding (Welcome is built) (`WORK.md`)
- Wire `TextSizes.large` in when Settings → Text size is built

## Blockers
- Not checked on a device yet (no EAS project ID, no simulator). The full Android bundle from the dev-server manifest builds cleanly in Metro (1561 modules). The earlier "1387 modules" check used a bundle URL without `transform.routerRoot`, so it did not include the app routes.

## Log
- 2026-10-21: Matched the foundation to the final design (`design/visus-screens-unpacked.html`). Theme: confirmed Ocean accent (`#3C7EBE` / `#E0F1FF` / `#194F81` / `#7ABDFF`), hero 38px, `TextSizes.normal` + `TextSizes.large`, `Type.option`, `borderOption #E4E4E0`. Components: new `ScreenHeader` + `HeaderButton` (back/close bar used on every non-tab screen), `TestHeader` built on it; Chip uses 17/500 with `#E4E4E0` border, family-chip style with `ChipAvatar`; `Pill` sizes sm/md; Icon keeps each design viewBox so strokes match; tab bar sits 26px from the bottom, tab screens leave 112px. Welcome screen built with `assets/images/visus-eye.png` (copy fix: "Tests run on your phone."). Committed the design export in `design/`.
- 2026-10-21: Exported the readable Claude Design files to `design/claude-design/` (style rules, runtime) and documented the missing full export in `design/README.md`.
- 2026-10-21: Mobile foundation (`feat/mobile-foundation`). Theme in `src/constants/theme.ts` (colours, status colours, Figtree, spacing, radius, sizes, type). Components: Button, Card, Chip/StatusBadge/Pill, ListRow, TestHeader, BottomTabBar (floating pill), Icon (design SVGs), Screen, Placeholder. Routes: `index` → `/welcome`, `(auth)` welcome/signup/login, `(tabs)` home/tests/results/profile as placeholders. `services/api.ts` (request helper, `USE_MOCK`, `mockDelay`) + empty `services/mock/`. Removed Expo template screens, components, hooks and assets. Added `react-native-svg`, `@expo-google-fonts/figtree`, ESLint config. App set to light mode only.
