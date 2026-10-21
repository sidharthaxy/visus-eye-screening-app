@AGENTS.md

# apps/mobile: Expo app

Owner: Dhrutinandan. Read the root `CLAUDE.md` first.

## Stack

- Expo SDK 57, Expo Router (routes in `src/app/`), TypeScript
- `@shopify/react-native-skia` for drawing tests, `react-native-reanimated` + `react-native-gesture-handler` for motion
- `zustand` for check state, `@tanstack/react-query` for server data
- `@visus/shared` for types and the test catalog

## Phases

1. **Screens on mock data (now):** test in **Expo Go**. Only use libraries Expo Go already includes (Skia, Reanimated, Gesture Handler, Expo SDK modules).
2. **Native features (build sprint):** camera distance (VisionCamera), Screen Coach (Android native module). These need an EAS development build. Ask before adding any library that breaks Expo Go.

## Layout

```
src/
  app/          routes, exactly as in docs/SCREENS.md
  components/   shared UI (Button, Card, Chip, TestHeader...)
  constants/    theme: colours, type, spacing from the design
  services/     api.ts + one file per server area (auth, sessions, profiles)
    mock/       mock data until the server route is live
  tests/        one component per test, keyed by TestId (Skia)
  store/        zustand stores (current check, calibration)
```

## Rules

- Screens use `src/services/*`. Never `fetch` in a screen, never import from `mock/` in a screen.
- Tests only collect raw answers and send them; the server scores.
- Test sizes come from `pxPerMm` in the calibration store.
- Import `Text` and `TextInput` from `@/components/Text`, never from `react-native`: they follow Settings → Text size. Use `FixedText` for test symbols sized in mm (it ignores both the app and the phone font size). Control heights come from `useSizes()` (`store/settings.ts`).
- Login, settings and calibration are saved on the phone (zustand `persist` + AsyncStorage, `store/storage.ts`); the root layout waits for them (`useHydrated`).
- Android is the target.
- Replace the Expo template example screens (`explore.tsx`, template components) as you build.
- Use the Expo skills and Expo MCP tools (screenshots, logs) to check screens against the design.
