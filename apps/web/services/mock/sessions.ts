// Stand-in for the server until the routes are live. The scores here are canned:
// the real scoring and rules live on the server.
import { TEST_CATALOG, type Category, type NextStep, type ScoredResult, type Status, type SubmitResult, type TestId, type Verdict } from "@visus/shared";

import type { CheckMode, CreatedSession, History, SessionListItem } from "../sessions";
import { delay, load, save, uid } from "./store";

type MockSession = {
  id: string;
  mode: CheckMode;
  date: string;
  plan: TestId[];
  results: ScoredResult[];
  redFlagShown: boolean;
};

const REASONS: Partial<Record<TestId, string>> = {
  tumbling_e: "Sharpness of far-away detail",
  clock_dial: "Can make lights streak at night",
  amsler: "Checks your central vision",
  contrast: "Night blur often starts here",
  near_reading: "Small print up close",
  glare_night: "Halos and glare from headlights",
  kids_tumbling_e: "Sharpness, made into a game",
  kids_colour_shapes: "Colour vision with shapes",
};

const CANNED: Record<TestId, Omit<ScoredResult, "testId" | "eye">> = {
  tumbling_e: { score: 82, status: "mild", summary: "Right eye 20/20, left eye 20/30" },
  near_reading: { score: 90, status: "good", summary: "Smallest clear line N8" },
  near_point: { score: 84, status: "good", summary: "Right eye 11 cm, left eye 13 cm" },
  clock_dial: { score: 92, status: "good", summary: "Right eye even, left eye even" },
  duochrome: { score: 88, status: "good", summary: "Right eye balanced, left eye balanced" },
  amsler: { score: 40, status: "see_doctor", summary: "Right eye grid normal, left eye wavy lines" },
  contrast: { score: 76, status: "mild", summary: "Faintest seen: 3 of 6" },
  colour_plates: { score: 95, status: "good", summary: "11 of 12 plates read" },
  kids_tumbling_e: { score: 88, status: "good", summary: "Right eye 6/9, left eye 6/9" },
  kids_colour_shapes: { score: 100, status: "good", summary: "6 of 6 shapes found" },
  risk_screener: { score: 70, status: "mild", summary: "2 risk factors" },
  eye_strain: { score: 65, status: "mild", summary: "Moderate eye strain" },
  glare_night: { score: 60, status: "mild", summary: "Some glare at night" },
  peripheral_field: { score: 90, status: "good", summary: "Right eye 24 of 24, left eye 22 of 24" },
};

const PLANS: Record<Exclude<CheckMode, "single">, TestId[]> = {
  full: ["tumbling_e", "clock_dial", "amsler", "contrast"],
  quick: ["tumbling_e", "amsler", "clock_dial"],
  glasses: ["tumbling_e"],
};

const sessions = () => load<Record<string, MockSession>>("sessions", {});
const put = (s: MockSession) => save("sessions", { ...sessions(), [s.id]: s });

export async function create(input: { profileId: string; intake: string; mode: CheckMode; testId?: TestId }): Promise<CreatedSession> {
  await delay(900);
  const child = load<{ id: string; isChild: boolean }[]>("profiles", []).find((p) => p.id === input.profileId)?.isChild ?? input.profileId === "p2";
  const plan =
    input.mode === "single" && input.testId
      ? [input.testId]
      : input.mode === "full" && child
        ? (["kids_tumbling_e", "kids_colour_shapes"] as TestId[])
        : PLANS[input.mode === "single" ? "full" : input.mode];
  const s: MockSession = { id: uid(), mode: input.mode, date: new Date().toISOString(), plan, results: [], redFlagShown: false };
  put(s);
  return {
    sessionId: s.id,
    summary: input.intake ? "Based on blurry distance vision at night, in both eyes." : "A quick read on sharpness, focus and central vision.",
    plan: plan.map((testId) => ({ testId, reason: REASONS[testId] ?? "Picked for you" })),
  };
}

export async function submit(sessionId: string, r: SubmitResult): Promise<NextStep> {
  await delay(700);
  const s = sessions()[sessionId] ?? { id: sessionId, mode: "full", date: new Date().toISOString(), plan: PLANS.full, results: [], redFlagShown: false };
  const result: ScoredResult = { testId: r.testId, eye: r.eye, ...CANNED[r.testId] };
  s.results = [...s.results.filter((x) => x.testId !== r.testId), result];

  if (r.testId === "amsler" && !s.redFlagShown) {
    s.redFlagShown = true;
    put(s);
    return { type: "red_flag", result, finding: "Wavy lines near the centre" };
  }
  put(s);
  const next = s.plan.find((id) => !s.results.some((x) => x.testId === id));
  if (!next) return { type: "done", result };
  return { type: "next_test", result, testId: next, reason: REASONS[next] ?? "Next in your plan", added: false };
}

const worst = (a: Status | undefined, b: Status): Status => {
  const rank: Status[] = ["good", "mild", "see_doctor"];
  return !a || rank.indexOf(b) > rank.indexOf(a) ? b : a;
};

const LENS: Verdict["lens"] = [
  {
    product: "ZEISS DriveSafe",
    lensType: "Single vision lens",
    reason: "You noticed blurry signs at night. These lenses cut headlight glare and keep detail clear in low light.",
    coatings: [
      { name: "ZEISS BlueGuard", reason: "For your 4h+ of daily screen time" },
      { name: "DuraVision Platinum UV", reason: "Fewer reflections, resists scratches" },
    ],
  },
  {
    product: "ZEISS SmartLife",
    lensType: "Single vision lens",
    reason: "Made for a life that switches between screens and the world around you, all day.",
    coatings: [{ name: "DuraVision Platinum UV", reason: "Fewer reflections, resists scratches" }],
  },
];

export async function verdict(sessionId: string): Promise<Verdict> {
  await delay(500);
  const s = sessions()[sessionId];
  const results: ScoredResult[] = s?.results.length
    ? s.results
    : PLANS.full.map((testId) => ({ testId, eye: "both", ...CANNED[testId] }));
  const areas: Partial<Record<Category, Status>> = {};
  for (const r of results) {
    const cat = TEST_CATALOG.find((t) => t.id === r.testId)!.category;
    areas[cat] = worst(areas[cat], r.status);
  }
  const doctor = results.some((r) => r.status === "see_doctor");
  return {
    sessionId,
    headline: doctor ? "Mostly healthy, one thing to follow up" : "Your eyes look healthy",
    advice: doctor ? "Book an eye doctor for your left eye this week." : "Check again in about 3 months.",
    areas,
    results,
    lens: LENS,
  };
}

const PAST: SessionListItem[] = [
  { id: "past-oct", date: "2026-10-12", mode: "full", title: "Full eye check", testCount: 4, categoryLabel: "", status: "good" },
  { id: "past-sep", date: "2026-09-14", mode: "single", title: "Distance acuity", testCount: 1, categoryLabel: "Clarity", status: "mild" },
  { id: "past-aug", date: "2026-08-20", mode: "full", title: "Full eye check", testCount: 4, categoryLabel: "", status: "good" },
  { id: "past-jul", date: "2026-07-18", mode: "single", title: "Colour vision plates", testCount: 1, categoryLabel: "Colour", status: "good" },
];

const CATEGORY_LABEL: Record<Category, string> = {
  clarity: "Clarity",
  focus: "Focus",
  eye_health: "Eye Health",
  colour: "Colour",
  comfort: "Comfort",
  kids: "Kids",
};

export async function history(): Promise<History> {
  await delay(250);
  const own = Object.values(sessions())
    .filter((s) => s.results.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((s): SessionListItem => {
      const first = TEST_CATALOG.find((t) => t.id === s.results[0].testId)!;
      return {
        id: s.id,
        date: s.date,
        mode: s.mode,
        title: s.mode === "single" ? first.name : s.mode === "quick" ? "Quick check" : s.mode === "glasses" ? "Glasses check" : "Full eye check",
        testCount: s.results.length,
        categoryLabel: CATEGORY_LABEL[first.category],
        status: s.results.reduce<Status>((w, r) => worst(w, r.status), "good"),
      };
    });
  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  return {
    sessions: [...own, ...PAST],
    trends: [
      { label: "Sharpness", months, values: [78, 80, 79, 82, 84, 86] },
      { label: "Contrast", months, values: [70, 72, 71, 74, 73, 76] },
      { label: "Colour", months, values: [92, 92, 94, 93, 95, 95] },
    ],
  };
}

export async function share(sessionId: string) {
  await delay(400);
  return { url: `https://visus.app/r/${sessionId}`, expiresAt: new Date(Date.now() + 864e5).toISOString() };
}
