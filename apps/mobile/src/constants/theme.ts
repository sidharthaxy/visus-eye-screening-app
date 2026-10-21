// Visus theme, taken from the Claude Design handoff (v2 "clean" style).
// Light only: the design has no dark mode.
import type { Status } from '@visus/shared';
import type { TextStyle } from 'react-native';

export const Colors = {
  bg: '#F7F7F4', // pearl off-white screen background
  card: '#FFFFFF',
  cardHover: '#FAFAF8',
  border: '#ECECE8', // card border
  borderStrong: '#DEDED9', // secondary button / input border
  borderOption: '#E4E4E0', // unselected chips and options, empty progress segments
  divider: '#F0F0EC', // between list rows
  ink: '#111111',
  inkSoft: '#3A3A37', // text on grey pills
  muted: '#5F5F5B', // secondary text
  faint: '#9A9A95', // chevrons, placeholders
  tabInactive: '#6E6E69',
  fill: '#F0F0ED', // round icon backgrounds, pressed tiles
  pill: '#ECECE8', // grey pills, exit button
  pressed: '#F4F4F1',
  dashed: '#BDBDB8',
  hero: '#141414', // dark "Due today" card
  white: '#FFFFFF',

  // Accent "Ocean" (hue 250). The design defines these in OKLCH; hex is converted.
  acc: '#3C7EBE', // oklch(0.58 0.12 250)
  accSoft: '#E0F1FF', // oklch(0.95 0.03 250), soft backgrounds
  accInk: '#194F81', // oklch(0.42 0.1 250), accent text on accSoft
  accBright: '#7ABDFF', // oklch(0.78 0.12 250), accent on dark cards
} as const;

export const StatusColors: Record<Status, { bg: string; fg: string; dot: string; label: string }> = {
  good: { bg: '#E6F2EA', fg: '#1D6A3E', dot: '#2E8B57', label: 'Looks good' },
  mild: { bg: '#FBF0DC', fg: '#8A5A12', dot: '#C98A1B', label: 'Mild change' },
  see_doctor: { bg: '#FBE7E4', fg: '#A3342A', dot: '#C8473B', label: 'See a doctor' },
};

/** Figtree, loaded in the root layout. */
export const Fonts = {
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20, // screen side padding
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  button: 16,
  tile: 18,
  card: 20,
  hero: 24,
  pill: 999,
} as const;

/**
 * Sizes per text size (Settings → Text size). `normal` and `large` are from the
 * design; `larger` continues the same steps. `scale` multiplies every font size
 * (see components/Text.tsx); the other values are the matching control heights.
 */
export const TextSizes = {
  normal: { scale: 1, hero: 38, question: 28, body: 17, button: 56, buttonFont: 17, option: 58, optionFont: 17, chip: 44 },
  large: { scale: 1.12, hero: 42, question: 32, body: 19, button: 62, buttonFont: 19, option: 66, optionFont: 19, chip: 52 },
  larger: { scale: 1.25, hero: 47, question: 35, body: 21, button: 68, buttonFont: 21, option: 74, optionFont: 21, chip: 58 },
} as const;

const T = TextSizes.normal;

/** Fixed sizes from the design. */
export const Sizes = {
  button: T.button,
  chip: T.chip,
  option: T.option, // option rows and text inputs
  rowMin: 62,
  rowIcon: 38,
  iconButton: 44,
  tabBar: 66,
} as const;

/** Letter spacing in the design is in em; React Native needs px. */
const em = (size: number, value: number) => size * value;

export const Type = {
  hero: { fontFamily: Fonts.bold, fontSize: T.hero, lineHeight: T.hero * 1.08, letterSpacing: em(T.hero, -0.03) },
  title: { fontFamily: Fonts.bold, fontSize: 30, lineHeight: 35, letterSpacing: em(30, -0.025) },
  question: { fontFamily: Fonts.bold, fontSize: T.question, lineHeight: T.question * 1.15, letterSpacing: em(T.question, -0.02) },
  h1: { fontFamily: Fonts.bold, fontSize: 24, lineHeight: 29, letterSpacing: em(24, -0.02) },
  h2: { fontFamily: Fonts.bold, fontSize: 22, lineHeight: 26, letterSpacing: em(22, -0.02) },
  h3: { fontFamily: Fonts.bold, fontSize: 18, lineHeight: 23, letterSpacing: em(18, -0.01) },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: Fonts.regular, fontSize: T.body, lineHeight: T.body * 1.5 },
  bodySmall: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22 },
  rowTitle: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 20 },
  button: { fontFamily: Fonts.semibold, fontSize: T.buttonFont },
  option: { fontFamily: Fonts.medium, fontSize: T.optionFont },
  label: { fontFamily: Fonts.semibold, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18 },
  tab: { fontFamily: Fonts.semibold, fontSize: 12 },
} satisfies Record<string, TextStyle>;
