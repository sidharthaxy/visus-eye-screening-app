# Visus mobile

Expo SDK 57 app (Expo Router), Android first. See `CLAUDE.md` for structure and rules, `../../docs/SCREENS.md` for every screen and route.

## Run

```bash
bun install              # repo root, once
bunx expo start          # Metro on :8081, open in Expo Go on the phone
bunx tsc --noEmit        # typecheck
bunx expo lint           # lint
```

Everything runs in **Expo Go** (no development build yet). Camera distance and Screen Coach (Phase 3) will need an EAS development build.

## Data

- Screens call `src/services/*` only. Every service returns mock data from `src/services/mock/` while `USE_MOCK` is `true` in `src/services/api.ts`; turn it off one service at a time as server routes go live (`docs/API.md`).
- `EXPO_PUBLIC_API_URL`: server URL (default `http://localhost:8787`; on a phone use the Mac's Wi-Fi IP with `bunx wrangler dev --ip 0.0.0.0`).
- `EXPO_PUBLIC_WEB_URL`: web app for report links, terms and privacy (default `https://visus.app`).
- Login, settings, calibration and tests taken offline are saved on the phone (AsyncStorage). Mock data (profiles, history) resets on reload.

## What's built

All Phase 1 and Phase 2 screens on mock data:

- Auth and onboarding: Welcome, Sign up, Log in, Onboarding (7 steps), Permissions
- Tabs: Home (re-check reminder), Tests (filter, search), Results (trend, past checks), Profile (family)
- Check flow: Who is this for, Kids intro, Issue intake (offline state), Test plan, Calibration, Instructions, 14 tests, Switch eye, Test paused, Exit, Between-test, Red flag, Analysing
- Check modes: full, quick (1 minute), single test, glasses check (without vs with)
- After the check: Results, Test result detail (+ peripheral field map), Lens suggestions, Share report (QR, PDF, WhatsApp), Single test complete
- Profile area: Edit profile, Add family member, My glasses, Settings (text size, reminders, log out), About
- States: Error, Offline

Not yet: Distance warning (needs camera distance, Phase 3), Screen Coach (Phase 3), real API.
