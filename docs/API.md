# API

Hono on Cloudflare Workers. Types come from `packages/shared` (`@visus/shared`).

- Local: `http://localhost:8787` (phone: `bunx wrangler dev --ip 0.0.0.0`, then use your Mac's Wi-Fi IP)
- Auth: send `Authorization: Bearer <token>` on every route except `/health`, `/auth/signup`, `/auth/login`
- Errors: `{ "error": "message" }` with a 4xx/5xx status

**D** = Dhrutinandan, **T** = Teammate. Status: planned → mock (apps use mock data) → live.

| Route | Request | Response | Owner | Status |
|---|---|---|---|---|
| `GET /health` | — | `{ ok: true }` | D | planned |
| `POST /auth/signup` | `SignupRequest` | `AuthResponse` | D | planned |
| `POST /auth/login` | `LoginRequest` | `AuthResponse` | D | planned |
| `GET /me` | — | `{ user, profiles: Profile[] }`, owner first | D | mock |
| `POST /profiles` | `Profile` without `id` | `Profile` | D | planned |
| `PATCH /profiles/:id` | partial `Profile` | `Profile` | D | mock |
| `POST /sessions` | `CreateSessionRequest` | `CreateSessionResponse` | D | planned |
| `POST /sessions/:id/results` | `SubmitResult` | `NextStep` | D (route) + T (scoring, rules) | planned |
| `POST /sessions/:id/verdict` | — | `Verdict` | D (route) + T (lens) | planned |
| `GET /sessions` | — | `SessionSummary[]`, newest first | T | mock |
| `GET /sessions/:id` | — | `Verdict` (with `date`, `minutes`) | T | mock |
| `POST /sessions/:id/share` | — | `ShareLink` (`{ url, expiresAt }`, 24 h) | T | mock |

## Check modes

- `CreateSessionRequest.mode`: `full` (intake → AI plan), `quick` (Tumbling E → Amsler → Clock dial), `glasses` (Tumbling E twice), `single` (one test, `testId`).
- A `full` check for a child profile (`isChild`) gets the kids tests (mock: Kids Tumbling E → Kids colour shapes); there is no intake chat, so `intake` is empty.
- Quick check: Tumbling E answers carry `quick: true` (chart starts at 6/12, 3 letters per line, a line ends after 2 right or 2 wrong).
- Glasses check: each Tumbling E result carries `answers.round`: `"glasses_off"` (round 1) or `"glasses_on"` (round 2). The plan repeats the test, so the next test is decided by how many results are in, not by test id. The verdict's `headline`/`advice` say whether the glasses still work ("Your glasses still work well" / "Your glasses may need an update"); the app compares `results[0].eyes` (without) and `results[1].eyes` (with).

## Offline

- A single test taken offline (mobile) keeps its `SubmitResult` on the phone. When the phone is back online the app sends it as a normal single check: `POST /sessions` (mode `single`) → `POST /sessions/:id/results` → `POST /sessions/:id/verdict`. `durationSec` is the time the test took offline.

## What the result screens read

- `ScoredResult` always has `score`, `status`, `summary`. The optional fields fill Test result detail (18) and Single test complete (48); a screen hides a section when its field is missing:
  - `eyes.right` / `eyes.left`: `{ value: "20/30", score, status, detail? }` for "Left vs right" (one-eye-at-a-time tests and contrast).
  - `meaning`: "What it means", 1–2 plain sentences. `tip`: one practical next step.
  - `field` (`peripheral_field` only): `{ right, left }` lists of `{ angleDeg, xMm, yMm, seen }` from the answers, for the field map (58).
- `SessionSummary.tests` and `.scores` (score per test) feed the Results tab: the trend chart (Sharpness = `tumbling_e`, Contrast = `contrast`, Colour = `colour_plates`) and "N tests" on each past check.
- `SessionSummary.profileId`: Profile shows each family member's last check.
- `Profile.relation`, `.eyewear`, `.pastEyeTest`/`.pastEyeNote`, `.prescription` (`null` = "I don't know"), `.savedLens` (`{ product, sessionId }` from Lens "Save") fill Profile, Edit profile, Add family member and My glasses.
- `Verdict.date` and `.minutes` fill "Today · 5 tests · 11 min" on Results (17).

## How `POST /sessions/:id/results` works

1. Validate `SubmitResult`.
2. `scoring/` turns raw answers into a `ScoredResult` (T).
3. Save the result.
4. `rules/` checks for a red flag, then for an obvious next test (T).
5. If the rules can't decide, `agent/` asks Gemini to re-plan, choosing only from `TEST_CATALOG` (D).
6. Return `NextStep`.

## Answers format per test

Each test screen sends `answers` in the shape its scorer expects. Shapes below are what the mobile app sends today (raw answers only, nothing scored).

Tests done one eye at a time (`eachEye` in `TEST_CATALOG`) send **one** result for both eyes: `eye: "both"` and `answers: { right: <shape>, left: <shape> }`. Right eye is tested first. Other tests send `eye: "both"` and the shape directly.

`pxPerMm` is screen points per mm from calibration; `calibrated: false` means the app used a 160 dpi guess.

| Test | `answers` shape (per eye where it applies) |
|---|---|
| `tumbling_e` | `{ distanceCm: 40, pxPerMm, calibrated, trials: [{ line: "6/24", sizeMm, shown, answer }] }`. `shown`/`answer`: `"up" \| "down" \| "left" \| "right"` (the way the E's legs point). `sizeMm` is the E height actually drawn (rounded to whole pixels). The chart starts at 6/60, moves to the next line after 3 right answers and stops after 3 wrong ones on a line (or after the last line). Lines too small to draw on that screen are skipped. |
| `clock_dial` | `{ darker: ["3-9", "12-6"], allSame: boolean }`. Line pairs by clock hours; `darker` is empty when `allSame` is true. |
| `amsler` | `{ gridSize: 10, marked: number[], allStraight: boolean }`. `marked` = areas the user marked as wavy, blurry or missing, `row * 10 + column` from the top-left (centre dot between 44, 45, 54, 55). |
| `contrast` | `{ distanceCm: 40, pxPerMm, calibrated, letterHeightMm, letters: [{ letter, color, contrast }], faintestSeen: number \| null, noneSeen: boolean }`. `letters` go darker → fainter; `contrast` is the Weber contrast on white (0.994 … 0.062). `faintestSeen` is an index into `letters`. Both eyes together. |
| `near_reading` | `{ distanceCm: 40, pxPerMm, calibrated, language: "en" \| "hi" \| "or", smallestRead: "N8", lines: [{ label: "N36", sizeMm }] }`. N-scale print sizes (N × 0.3528 mm), both eyes. |
| `near_point` | `{ blurCm, distanceSource: "manual", textSizeMm, pxPerMm, calibrated }` per eye. `blurCm` (10–40) is where the text blurred; the user sets it on a slider until camera distance exists (then `distanceSource: "camera"`). |
| `duochrome` | `{ clearer: "red" \| "green" \| "same" }` per eye. |
| `peripheral_field` | `{ distanceCm: 30, pxPerMm, calibrated, dotMm: 2.25, trials: [{ angleDeg, xMm, yMm, seen, reactionMs }], falseTaps }` per eye. 24 dots, `angleDeg` 0 = right, clockwise; `xMm`/`yMm` from the centre dot (y down). A tap counts within 1.5 s of a dot appearing. |
| `colour_plates` | `{ plates: [{ plate: 1, shown: "12", answer: "12" \| null }] }`. 12 plates; plate 1 is a demo everyone should read; `null` = "I don't see a number". Both eyes. |
| `kids_tumbling_e` | Same as `tumbling_e` (6 lines, 6/60 to 6/9), per eye. |
| `kids_colour_shapes` | `{ plates: [{ plate: 1, shown, answer }] }` with `"star" \| "circle" \| "square" \| "nothing"`. 6 plates, plate 1 is a demo. |
| `risk_screener` | `{ answers: [{ question, answer, index }] }`. Options `Yes` / `No` / `Not sure` (index 0–2). |
| `eye_strain`, `glare_night` | `{ answers: [{ question, answer, index }] }`. Options `Never` / `Sometimes` / `Often` / `Always` (index 0–3). |
