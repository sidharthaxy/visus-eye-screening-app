// Screen text for the Tests library and Test detail. Test data (names,
// minutes, ages, eyes) comes from TEST_CATALOG in @visus/shared.
import { TEST_CATALOG, type Category, type TestId, type TestInfo } from '@visus/shared';

import type { IconName } from '@/components/Icon';

export const CATEGORIES: { id: Category; tile: string; title: string; question: string; icon: IconName | 'E' }[] = [
  { id: 'clarity', tile: 'Clarity', title: 'Clarity', question: 'How sharp is my vision, far and near?', icon: 'E' },
  { id: 'focus', tile: 'Focus', title: 'Focus', question: 'Do my eyes focus properly? Are my glasses still right?', icon: 'focus' },
  { id: 'eye_health', tile: 'Eye Health', title: 'Eye Health', question: 'Are there signs I should see a doctor?', icon: 'eyeHealth' },
  { id: 'colour', tile: 'Colour', title: 'Colour', question: 'Can I tell colours apart correctly?', icon: 'colour' },
  { id: 'comfort', tile: 'Comfort', title: 'Comfort & Lifestyle', question: 'How do screens, driving and daily habits affect my eyes?', icon: 'comfort' },
  { id: 'kids', tile: 'Kids', title: 'Kids', question: 'Child-friendly versions, done with a parent.', icon: 'kids' },
];

type TestCopy = {
  /** Under the name on Test detail. */
  subtitle: string;
  /** Before the minutes in lists, e.g. "Tumbling E · 3 min". */
  listPrefix?: string;
  checks: string;
  whoFor: [string, string, string];
};

// Only Distance acuity is in the design; the rest follow its tone. Edit freely.
export const TEST_COPY: Record<TestId, TestCopy> = {
  tumbling_e: {
    subtitle: 'Tumbling E test',
    listPrefix: 'Tumbling E',
    checks: 'How clearly you see detail from a distance. You point which way each E faces as the letters get smaller.',
    whoFor: ['Anyone aged 6 and up', 'Checking if your glasses still work', 'Noticing blurry signs or TV text'],
  },
  near_reading: {
    subtitle: 'Reading chart at 40 cm',
    checks: 'How clearly you read small print up close. You read short lines of text that get smaller, holding the phone at reading distance.',
    whoFor: ['Anyone aged 8 and up', 'Finding small print harder to read', 'Holding your phone further away to read'],
  },
  near_point: {
    subtitle: 'How close you can focus',
    checks: 'The closest distance your eyes can still focus. You slowly bring the phone closer until the text starts to blur.',
    whoFor: ['Anyone aged 13 and up', 'Tired eyes after reading or screens', 'Over 40 and noticing close-up blur'],
  },
  clock_dial: {
    subtitle: 'Clock dial test',
    checks: 'Whether some line directions look sharper than others, a sign of astigmatism. You tap any lines that look darker or bolder.',
    whoFor: ['Anyone aged 13 and up', 'Blur or ghosting at all distances', 'Squinting to see clearly'],
  },
  duochrome: {
    subtitle: 'Duochrome test',
    checks: 'Whether your eyes focus slightly in front of or behind the target. You say whether the letters look sharper on red or on green.',
    whoFor: ['Anyone aged 13 and up', 'Checking if your glasses are too strong or too weak', 'Glasses wearers with tired eyes'],
  },
  amsler: {
    subtitle: 'Grid test for central vision',
    checks: 'Changes in your central vision. You look at a dot in the middle of a grid and mark any lines that look wavy, blurry or missing.',
    whoFor: ['Anyone aged 13 and up', 'Over 50, or living with diabetes', 'Straight lines that look bent or wavy'],
  },
  contrast: {
    subtitle: 'Faint letters test',
    checks: 'How well you see things that are faint or low in contrast. You pick out letters as they fade into the background.',
    whoFor: ['Anyone aged 13 and up', 'Trouble seeing in dim light or fog', 'Driving at dusk or at night'],
  },
  peripheral_field: {
    subtitle: 'Dot field test',
    checks: 'How much you notice at the edges of your view. You keep your eyes on a centre dot and tap when a dot appears around it.',
    whoFor: ['Anyone aged 13 and up', 'Bumping into things at your sides', 'A family history of glaucoma'],
  },
  colour_plates: {
    subtitle: 'Dot plate test',
    checks: 'How well you tell certain colours apart. You read numbers hidden in circles of coloured dots.',
    whoFor: ['Anyone aged 8 and up', 'Mixing up reds and greens', 'Jobs or hobbies that rely on colour'],
  },
  risk_screener: {
    subtitle: 'Questionnaire',
    listPrefix: 'Questionnaire',
    checks: 'Your risk factors for common eye conditions. You answer a few short questions about your health and family.',
    whoFor: ['Adults aged 18 and up', 'Living with diabetes or high blood pressure', 'Eye disease in the family'],
  },
  eye_strain: {
    subtitle: 'Questionnaire',
    listPrefix: 'Questionnaire',
    checks: 'How much screens and close work strain your eyes. You rate symptoms like dryness, burning and headaches.',
    whoFor: ['Anyone aged 13 and up', 'Long hours on screens', 'Dry, tired or sore eyes'],
  },
  glare_night: {
    subtitle: 'Questionnaire',
    listPrefix: 'Questionnaire',
    checks: 'How glare and low light affect your vision. You answer questions about night driving, halos and bright lights.',
    whoFor: ['Anyone aged 16 and up', 'Halos or starbursts around lights', 'Discomfort driving at night'],
  },
  kids_tumbling_e: {
    subtitle: 'Tumbling E for children',
    listPrefix: 'With a parent',
    checks: 'How clearly your child sees from a distance. They point which way each E faces while you help.',
    whoFor: ['Children aged 5 and up', 'Squinting or sitting close to the TV', 'Before starting school'],
  },
  kids_colour_shapes: {
    subtitle: 'Colour shapes for children',
    listPrefix: 'With a parent',
    checks: 'Whether your child tells colours apart. They find simple shapes hidden in coloured dots.',
    whoFor: ['Children aged 5 and up', 'Mixing up colours when drawing', 'A family history of colour blindness'],
  },
};

export const testsIn = (category: Category) => TEST_CATALOG.filter((t) => t.category === category);

export const testInfo = (id: TestId) => TEST_CATALOG.find((t) => t.id === id);

/** "Tumbling E · 3 min", "Questionnaire · 1 min", "2 min". */
export function testListSub(t: TestInfo) {
  const prefix = TEST_COPY[t.id].listPrefix;
  return prefix ? `${prefix} · ${t.minutes} min` : `${t.minutes} min`;
}
