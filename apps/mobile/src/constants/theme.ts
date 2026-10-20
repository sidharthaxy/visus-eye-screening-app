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

  // Accent "Ocean". The design's accent tweak values were not in the export,
  // so these are derived from the brand blue in the design thumbnail.
  acc: '#2F6FD6',
  accSoft: '#E7EFFB',
  accInk: '#1F4FA3',
  accBright: '#6FA3F5',
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

/** Fixed sizes from the design (some were tweak values; these are their defaults). */
export const Sizes = {
  button: 56,
  chip: 44,
  input: 56,
  rowMin: 62,
  rowIcon: 38,
  iconButton: 44,
  tabBar: 66,
  /** Space screens leave at the bottom so content clears the floating tab bar. */
  tabBarInset: 112,
} as const;

/** Letter spacing in the design is in em; React Native needs px. */
const em = (size: number, value: number) => size * value;

export const Type = {
  hero: { fontFamily: Fonts.bold, fontSize: 40, lineHeight: 43, letterSpacing: em(40, -0.03) },
  title: { fontFamily: Fonts.bold, fontSize: 30, lineHeight: 35, letterSpacing: em(30, -0.025) },
  question: { fontFamily: Fonts.bold, fontSize: 28, lineHeight: 32, letterSpacing: em(28, -0.02) },
  h1: { fontFamily: Fonts.bold, fontSize: 24, lineHeight: 29, letterSpacing: em(24, -0.02) },
  h2: { fontFamily: Fonts.bold, fontSize: 22, lineHeight: 26, letterSpacing: em(22, -0.02) },
  h3: { fontFamily: Fonts.bold, fontSize: 18, lineHeight: 23, letterSpacing: em(18, -0.01) },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: Fonts.regular, fontSize: 17, lineHeight: 25 },
  bodySmall: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22 },
  rowTitle: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 20 },
  button: { fontFamily: Fonts.semibold, fontSize: 17 },
  label: { fontFamily: Fonts.semibold, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18 },
  tab: { fontFamily: Fonts.semibold, fontSize: 12 },
} satisfies Record<string, TextStyle>;
