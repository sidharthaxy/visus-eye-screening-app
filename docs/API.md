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
| `GET /me` | — | user + `Profile[]` | D | planned |
| `POST /profiles` | `Profile` without `id` | `Profile` | D | planned |
| `PATCH /profiles/:id` | partial `Profile` | `Profile` | D | planned |
| `POST /sessions` | `CreateSessionRequest` | `CreateSessionResponse` | D | planned |
| `POST /sessions/:id/results` | `SubmitResult` | `NextStep` | D (route) + T (scoring, rules) | planned |
| `POST /sessions/:id/verdict` | — | `Verdict` | D (route) + T (lens) | planned |
| `GET /sessions` | — | list: id, date, mode, headline, overall status | T | planned |
| `GET /sessions/:id` | — | `Verdict` | T | planned |
| `POST /sessions/:id/share` | — | `{ url, expiresAt }` | T | planned |

## How `POST /sessions/:id/results` works

1. Validate `SubmitResult`.
2. `scoring/` turns raw answers into a `ScoredResult` (T).
3. Save the result.
4. `rules/` checks for a red flag, then for an obvious next test (T).
5. If the rules can't decide, `agent/` asks Gemini to re-plan, choosing only from `TEST_CATALOG` (D).
6. Return `NextStep`.

## Answers format per test

Each test screen sends `answers` in the shape its scorer expects. Shapes below are what the mobile app sends today (raw answers only, nothing scored).

Tests done one eye at a time (`eachEye` in `TEST_CATALOG`: Tumbling E, clock dial, Amsler) send **one** result for both eyes: `eye: "both"` and `answers: { right: <shape>, left: <shape> }`. Right eye is tested first. Other tests send `eye: "both"` and the shape directly.

`pxPerMm` is screen points per mm from calibration; `calibrated: false` means the app used a 160 dpi guess.

| Test | `answers` shape (per eye where it applies) |
|---|---|
| `tumbling_e` | `{ distanceCm: 40, pxPerMm, calibrated, trials: [{ line: "6/24", sizeMm, shown, answer }] }`. `shown`/`answer`: `"up" \| "down" \| "left" \| "right"` (the way the E's legs point). `sizeMm` is the E height actually drawn (rounded to whole pixels). The chart starts at 6/60, moves to the next line after 3 right answers and stops after 3 wrong ones on a line (or after the last line). Lines too small to draw on that screen are skipped. |
| `clock_dial` | `{ darker: ["3-9", "12-6"], allSame: boolean }`. Line pairs by clock hours; `darker` is empty when `allSame` is true. |
| `amsler` | `{ gridSize: 10, marked: number[], allStraight: boolean }`. `marked` = areas the user marked as wavy, blurry or missing, `row * 10 + column` from the top-left (centre dot between 44, 45, 54, 55). |
| `contrast` | `{ distanceCm: 40, pxPerMm, calibrated, letterHeightMm, letters: [{ letter, color, contrast }], faintestSeen: number \| null, noneSeen: boolean }`. `letters` go darker → fainter; `contrast` is the Weber contrast on white (0.994 … 0.062). `faintestSeen` is an index into `letters`. Both eyes together. |
