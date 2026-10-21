// Shared types and the test catalog for mobile, web and server.
// Types and constants only — no logic. Changes need both people's approval.
// DRAFT: agree on these together before building against them.
import { z } from "zod";

// ---------- Tests ----------

export const TEST_IDS = [
  "tumbling_e",
  "near_reading",
  "near_point",
  "clock_dial",
  "duochrome",
  "amsler",
  "contrast",
  "colour_plates",
  "kids_tumbling_e",
  "kids_colour_shapes",
  "risk_screener",
  "eye_strain",
  "glare_night",
  "peripheral_field",
] as const;
export const TestId = z.enum(TEST_IDS);
export type TestId = z.infer<typeof TestId>;

export const Category = z.enum(["clarity", "focus", "eye_health", "colour", "comfort", "kids"]);
export type Category = z.infer<typeof Category>;

export const Eye = z.enum(["left", "right", "both"]);
export type Eye = z.infer<typeof Eye>;

/** good = "Looks good", mild = "Mild change", see_doctor = "See a doctor" */
export const Status = z.enum(["good", "mild", "see_doctor"]);
export type Status = z.infer<typeof Status>;

export type TestInfo = {
  id: TestId;
  name: string;
  category: Category;
  kind: "visual" | "questionnaire";
  minutes: number;
  minAge: number;
  eachEye: boolean;
  needsCalibration: boolean;
};

export const TEST_CATALOG: TestInfo[] = [
  { id: "tumbling_e", name: "Distance acuity", category: "clarity", kind: "visual", minutes: 3, minAge: 6, eachEye: true, needsCalibration: true },
  { id: "near_reading", name: "Near reading", category: "clarity", kind: "visual", minutes: 2, minAge: 8, eachEye: false, needsCalibration: true },
  { id: "near_point", name: "Near point", category: "focus", kind: "visual", minutes: 1, minAge: 13, eachEye: true, needsCalibration: true },
  { id: "clock_dial", name: "Astigmatism dial", category: "focus", kind: "visual", minutes: 1, minAge: 13, eachEye: true, needsCalibration: false },
  { id: "duochrome", name: "Red-green test", category: "focus", kind: "visual", minutes: 1, minAge: 13, eachEye: true, needsCalibration: false },
  { id: "amsler", name: "Amsler grid", category: "eye_health", kind: "visual", minutes: 2, minAge: 13, eachEye: true, needsCalibration: false },
  { id: "contrast", name: "Contrast sensitivity", category: "eye_health", kind: "visual", minutes: 3, minAge: 13, eachEye: false, needsCalibration: true },
  { id: "peripheral_field", name: "Peripheral vision", category: "eye_health", kind: "visual", minutes: 3, minAge: 13, eachEye: true, needsCalibration: false },
  { id: "colour_plates", name: "Colour vision plates", category: "colour", kind: "visual", minutes: 3, minAge: 8, eachEye: false, needsCalibration: false },
  { id: "risk_screener", name: "Eye risk screener", category: "eye_health", kind: "questionnaire", minutes: 1, minAge: 18, eachEye: false, needsCalibration: false },
  { id: "eye_strain", name: "Eye strain", category: "comfort", kind: "questionnaire", minutes: 1, minAge: 13, eachEye: false, needsCalibration: false },
  { id: "glare_night", name: "Glare & night vision", category: "comfort", kind: "questionnaire", minutes: 1, minAge: 16, eachEye: false, needsCalibration: false },
  { id: "kids_tumbling_e", name: "Kids: Tumbling E", category: "kids", kind: "visual", minutes: 2, minAge: 5, eachEye: true, needsCalibration: true },
  { id: "kids_colour_shapes", name: "Kids: Colour shapes", category: "kids", kind: "visual", minutes: 1, minAge: 5, eachEye: false, needsCalibration: false },
];

// ---------- Auth & profiles ----------

export const SignupRequest = z.object({
  name: z.string().min(1),
  identifier: z.string().min(3), // phone or email
  password: z.string().min(8).max(128),
});
export const LoginRequest = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1).max(128),
});
export const AuthResponse = z.object({
  token: z.string(),
  user: z.object({ id: z.string(), name: z.string(), identifier: z.string() }),
});

export const Profile = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().int().min(1).max(120),
  gender: z.string().optional(),
  isChild: z.boolean(),
  wearsGlasses: z.boolean(),
  healthConditions: z.array(z.string()),
  screenHoursPerDay: z.number().min(0).max(24),
});
export type Profile = z.infer<typeof Profile>;

// ---------- Check session ----------

export const CreateSessionRequest = z.object({
  profileId: z.string(),
  intake: z.string().max(2000), // what the user typed
  mode: z.enum(["full", "quick", "single", "glasses"]).default("full"), // same values as SessionMode
  testId: TestId.optional(), // for mode "single"
});

export const PlanItem = z.object({ testId: TestId, reason: z.string() });
export const CreateSessionResponse = z.object({
  sessionId: z.string(),
  summary: z.string(),
  plan: z.array(PlanItem),
});

/** Sent by the app after every test. Raw answers only — the server scores. */
export const SubmitResult = z.object({
  testId: TestId,
  eye: Eye,
  answers: z.record(z.string(), z.unknown()),
  durationSec: z.number().min(0),
});
export type SubmitResult = z.infer<typeof SubmitResult>;

/** One eye's part of a result ("Left vs right" on Test result detail). */
export const EyeResult = z.object({
  value: z.string(), // e.g. "20/30", "72", "22 of 24 seen"
  score: z.number().min(0).max(100), // bar length
  status: Status,
  detail: z.string().optional(), // e.g. "Faintest seen: 3 of 6"
});
export type EyeResult = z.infer<typeof EyeResult>;

/** One peripheral dot as shown, for the field map. angleDeg 0 = right, clockwise; mm from the centre dot, y down. */
export const FieldDot = z.object({ angleDeg: z.number(), xMm: z.number(), yMm: z.number(), seen: z.boolean() });

export const ScoredResult = z.object({
  testId: TestId,
  eye: Eye,
  score: z.number().min(0).max(100),
  status: Status,
  summary: z.string(), // e.g. "Right eye 20/20, left eye 20/30"
  // Optional detail for Test result detail (18) and Single test complete (48).
  eyes: z.object({ right: EyeResult.optional(), left: EyeResult.optional() }).optional(),
  meaning: z.string().optional(), // "What it means", 1–2 plain sentences
  tip: z.string().optional(),
  field: z.object({ right: z.array(FieldDot).optional(), left: z.array(FieldDot).optional() }).optional(), // peripheral_field only
});
export type ScoredResult = z.infer<typeof ScoredResult>;

/** Server reply after each test. */
export const NextStep = z.discriminatedUnion("type", [
  z.object({ type: z.literal("next_test"), result: ScoredResult, testId: TestId, reason: z.string(), added: z.boolean() }),
  z.object({ type: z.literal("red_flag"), result: ScoredResult, finding: z.string() }),
  z.object({ type: z.literal("done"), result: ScoredResult }),
]);
export type NextStep = z.infer<typeof NextStep>;

// ---------- Verdict ----------

export const LensSuggestion = z.object({
  product: z.string(), // e.g. "ZEISS DriveSafe"
  lensType: z.string(), // e.g. "Single vision"
  reason: z.string(),
  coatings: z.array(z.object({ name: z.string(), reason: z.string() })),
});
export type LensSuggestion = z.infer<typeof LensSuggestion>;

export const Verdict = z.object({
  sessionId: z.string(),
  headline: z.string(),
  advice: z.string(),
  areas: z.partialRecord(Category, Status),
  results: z.array(ScoredResult),
  lens: z.array(LensSuggestion),
  date: z.string().optional(), // ISO, when the check was taken
  minutes: z.number().optional(), // how long the check took
});
export type Verdict = z.infer<typeof Verdict>;

// ---------- Past checks & sharing ----------

export const SessionMode = z.enum(["full", "quick", "single", "glasses"]);
export type SessionMode = z.infer<typeof SessionMode>;

/** One row of GET /sessions, newest first. */
export const SessionSummary = z.object({
  id: z.string(),
  date: z.string(), // ISO
  mode: SessionMode,
  headline: z.string(),
  status: Status, // worst status of the check
  tests: z.array(TestId),
  scores: z.partialRecord(TestId, z.number().min(0).max(100)), // for the Results trend chart
});
export type SessionSummary = z.infer<typeof SessionSummary>;

/** POST /sessions/:id/share: a read-only report link for a doctor. */
export const ShareLink = z.object({ url: z.string(), expiresAt: z.string() });
export type ShareLink = z.infer<typeof ShareLink>;
