// Display copy for each test and category. Facts (minutes, ages, eyes) come from TEST_CATALOG.
import { TEST_CATALOG, type Category, type TestId, type TestInfo } from "@visus/shared";

import type { IconName } from "@/components/Icon";

export const CATEGORIES: { id: Category; label: string; name: string; question: string; icon: IconName | "E" }[] = [
  { id: "clarity", label: "Clarity", name: "Clarity", question: "How sharp is my vision, far and near?", icon: "E" },
  { id: "focus", label: "Focus", name: "Focus", question: "Do my eyes focus properly? Are my glasses still right?", icon: "focus" },
  { id: "eye_health", label: "Eye Health", name: "Eye Health", question: "Are there signs I should see a doctor?", icon: "health" },
  { id: "colour", label: "Colour", name: "Colour", question: "Can I tell colours apart correctly?", icon: "colour" },
  { id: "comfort", label: "Comfort", name: "Comfort & Lifestyle", question: "How do screens, driving and daily habits affect my eyes?", icon: "comfort" },
  { id: "kids", label: "Kids", name: "Kids", question: "Child-friendly versions, done with a parent.", icon: "kids" },
];

export const categoryOf = (id: Category) => CATEGORIES.find((c) => c.id === id)!;

type Copy = {
  title: string;
  subtitle: string;
  checks: string;
  forWho: string[];
  /** Steps on the instructions screen. */
  steps: string[];
};

export const TEST_COPY: Record<TestId, Copy> = {
  tumbling_e: {
    title: "Distance acuity",
    subtitle: "Tumbling E test",
    checks: "How clearly you see detail from a distance. You point which way each E faces as the letters get smaller.",
    forWho: ["Anyone aged 6 and up", "Checking if your glasses still work", "Noticing blurry signs or TV text"],
    steps: ["Place the screen 2 m away, at eye level.", "Cover your left eye with your palm. Don't press on it.", "Say which way each E points. A helper taps it, or use the arrow keys."],
  },
  near_reading: {
    title: "Near reading",
    subtitle: "Reading chart",
    checks: "How small a print you can read up close, like a phone screen or a menu.",
    forWho: ["Anyone aged 8 and up", "Struggling with small print", "Holding your phone further away to read"],
    steps: ["Hold the screen 40 cm away, about the length of your forearm.", "Keep both eyes open.", "Tap the smallest line you can read clearly."],
  },
  near_point: {
    title: "Near point",
    subtitle: "Focus distance test",
    checks: "How close you can focus before text blurs. This moves further away as eyes age.",
    forWho: ["Anyone aged 13 and up", "Tired eyes when reading", "Over 40 and noticing changes"],
    steps: ["Start with the screen 40 cm away.", "Cover your left eye with your palm.", "Move slowly closer and stop when the text starts to blur."],
  },
  clock_dial: {
    title: "Astigmatism clock dial",
    subtitle: "Clock dial test",
    checks: "Whether some lines look darker or sharper than the rest, a common sign of astigmatism.",
    forWho: ["Anyone aged 13 and up", "Lights that streak or smear at night", "Blur at every distance"],
    steps: ["Hold the screen at arm's length, about 40 cm away.", "Cover your left eye with your palm. Don't press on it.", "Tap any lines that look darker or sharper than the rest."],
  },
  duochrome: {
    title: "Red-green duochrome",
    subtitle: "Duochrome test",
    checks: "Whether letters look clearer on red or on green, a hint that your focus is slightly off.",
    forWho: ["Anyone aged 13 and up", "Checking if your glasses are too strong or weak", "Blur that comes and goes"],
    steps: ["Hold the screen at arm's length, about 40 cm away.", "Cover your left eye with your palm.", "Compare the black letters on each side."],
  },
  amsler: {
    title: "Amsler grid",
    subtitle: "Central vision test",
    checks: "Whether straight lines look wavy, blurry or missing in the centre of your vision.",
    forWho: ["Anyone aged 13 and up", "Over 50, or living with diabetes", "Straight lines that look bent"],
    steps: ["Hold the screen 40 cm away, in good light.", "Cover your left eye with your palm.", "Keep looking at the centre dot and tap any areas that look wrong."],
  },
  contrast: {
    title: "Contrast sensitivity",
    subtitle: "Faint letters test",
    checks: "How well you see faint, low-contrast letters. This often changes first in dim light.",
    forWho: ["Anyone aged 13 and up", "Trouble seeing at dusk or in fog", "Night driving feels harder"],
    steps: ["Turn your screen brightness up to full.", "Hold the screen 40 cm away, both eyes open.", "Tap the faintest letter you can still see."],
  },
  peripheral_field: {
    title: "Peripheral vision",
    subtitle: "Dot field test",
    checks: "How well you notice things at the edge of your vision while looking straight ahead.",
    forWho: ["Anyone aged 13 and up", "Bumping into things on one side", "Glaucoma in the family"],
    steps: ["Hold the screen 30 cm away.", "Cover your left eye and keep looking at the centre dot.", "Tap whenever a dot flashes. Don't move your eyes."],
  },
  colour_plates: {
    title: "Colour vision plates",
    subtitle: "Dot plate test",
    checks: "Whether you can pick out numbers hidden in coloured dots, a check for colour blindness.",
    forWho: ["Anyone aged 8 and up", "Mixing up reds and greens", "Jobs that need good colour vision"],
    steps: ["Turn your screen brightness up to full.", "Keep both eyes open.", "Pick the number you see in each plate. Guess if you are unsure."],
  },
  risk_screener: {
    title: "Eye risk screener",
    subtitle: "Questionnaire",
    checks: "A few questions about family history and health that can raise the risk of eye disease.",
    forWho: ["Adults aged 18 and up", "Diabetes or high blood pressure", "Glaucoma in the family"],
    steps: ["Answer five short questions.", "Pick “Not sure” if you don't know.", "Your answers stay private to your profile."],
  },
  eye_strain: {
    title: "Eye strain",
    subtitle: "Questionnaire",
    checks: "How much screens and close work tire your eyes over the day.",
    forWho: ["Anyone aged 13 and up", "Long hours on screens", "Headaches or dry eyes"],
    steps: ["Answer six short questions.", "Think about the last two weeks.", "There are no wrong answers."],
  },
  glare_night: {
    title: "Glare & night vision",
    subtitle: "Questionnaire",
    checks: "How much glare, halos and darkness affect what you see, especially when driving.",
    forWho: ["Anyone aged 16 and up", "Halos around headlights", "Avoiding driving at night"],
    steps: ["Answer five short questions.", "Think about the last month.", "There are no wrong answers."],
  },
  kids_tumbling_e: {
    title: "Kids tumbling E",
    subtitle: "With a parent",
    checks: "A playful version of the E test for young children. They point, you tap.",
    forWho: ["Children aged 5 and up", "Squinting at the TV or board", "Before a new school year"],
    steps: ["Sit next to your child, at the same eye level.", "Hold the screen 40 cm from their face, and cover their left eye.", "Let them point which way the E's legs go. You tap it for them."],
  },
  kids_colour_shapes: {
    title: "Kids colour shapes",
    subtitle: "With a parent",
    checks: "Finds shapes hidden in coloured dots, a colour check for children who can't read numbers yet.",
    forWho: ["Children aged 5 and up", "Mixing up colours", "Before school starts"],
    steps: ["Sit next to your child, in good light.", "Hold the screen 40 cm from their face.", "Let them say the shape they see. You tap it for them."],
  },
};

export const testInfo = (id: TestId): TestInfo => TEST_CATALOG.find((t) => t.id === id)!;

export const isTestId = (id: string): id is TestId => TEST_CATALOG.some((t) => t.id === id);

/** Second line in the library list, e.g. "Tumbling E · 3 min", "Questionnaire · 1 min". */
export function librarySub(t: TestInfo) {
  const pre = t.id === "tumbling_e" ? "Tumbling E · " : t.kind === "questionnaire" ? "Questionnaire · " : t.category === "kids" ? "With a parent · " : "";
  return `${pre}${t.minutes} min`;
}

export const eyesLabel = (t: TestInfo) => (t.eachEye ? "One at a time" : "Both together");
