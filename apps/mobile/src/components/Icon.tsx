// Line icons from the design. Each keeps the design's own viewBox, so the
// stroke widths used in the design render at the same thickness here.
import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';

const ICONS = {
  home: {
    box: 24,
    el: (
      <>
        <Path d="M3.5 11L12 4l8.5 7" />
        <Path d="M6 9.5V20h12V9.5" />
      </>
    ),
  },
  eye: {
    box: 24,
    el: (
      <>
        <Path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" />
        <Circle cx={12} cy={12} r={3} />
      </>
    ),
  },
  results: { box: 24, el: <Path d="M3.5 20.5h17M6.5 17v-5M12 17V6M17.5 17V9" /> },
  profile: {
    box: 24,
    el: (
      <>
        <Circle cx={12} cy={8.5} r={4} />
        <Path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6" />
      </>
    ),
  },
  eyeOff: {
    box: 24,
    el: (
      <>
        <Path d="M3.5 3.5l17 17" />
        <Path d="M10.6 5.6c.5-.1.9-.1 1.4-.1 6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.6 6.6C3.9 8.4 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.4 4.3-1" />
        <Path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    ),
  },
  checkLarge: { box: 24, el: <Path d="M5 12.5l4.5 4.5L19 7.5" /> },
  check: { box: 14, el: <Path d="M2.5 7.5l3 3 6-7" /> },
  minus: { box: 20, el: <Path d="M4 10h12" /> },
  plusBold: { box: 20, el: <Path d="M4 10h12M10 4v12" /> },
  // Test categories (Tests tiles).
  focus: {
    box: 26,
    el: (
      <>
        <Circle cx={13} cy={13} r={8} />
        <Circle cx={13} cy={13} r={1.8} fill="currentColor" />
        <Path d="M13 2v4M13 20v4M2 13h4M20 13h4" />
      </>
    ),
  },
  eyeHealth: {
    box: 26,
    el: (
      <>
        <Path d="M2.5 13s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S2.5 13 2.5 13z" />
        <Path d="M13 10v6M10 13h6" />
      </>
    ),
  },
  colour: {
    box: 26,
    el: (
      <>
        <Circle cx={13} cy={9} r={5.5} />
        <Circle cx={9} cy={16} r={5.5} />
        <Circle cx={17} cy={16} r={5.5} />
      </>
    ),
  },
  comfort: {
    box: 26,
    el: (
      <>
        <Rect x={3} y={4.5} width={20} height={13} rx={2.5} />
        <Path d="M9.5 22h7M13 17.5V22" />
      </>
    ),
  },
  kids: {
    box: 26,
    el: (
      <>
        <Circle cx={13} cy={13} r={10} />
        <Path d="M8.5 15.5c1.2 1.8 2.7 2.7 4.5 2.7s3.3-.9 4.5-2.7" />
        <Circle cx={9.5} cy={10.5} r={1} fill="currentColor" />
        <Circle cx={16.5} cy={10.5} r={1} fill="currentColor" />
      </>
    ),
  },
  sun: {
    box: 24,
    el: (
      <>
        <Circle cx={12} cy={12} r={4} />
        <Path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
      </>
    ),
  },
  armsLength: { box: 24, el: <Path d="M3 12h18M6 9l-3 3 3 3M18 9l3 3-3 3" /> },
  glasses: {
    box: 24,
    el: (
      <>
        <Circle cx={6.5} cy={14} r={3.5} />
        <Circle cx={17.5} cy={14} r={3.5} />
        <Path d="M10 14h4M3 14l1.5-6M21 14l-1.5-6" />
      </>
    ),
  },
  mic: {
    box: 24,
    el: (
      <>
        <Rect x={9} y={3} width={6} height={11} rx={3} />
        <Path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
      </>
    ),
  },
  send: { box: 20, el: <Path d="M10 16V4M5 9l5-5 5 5" /> },
  speaker: {
    box: 24,
    el: (
      <>
        <Path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
        <Path d="M15.5 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
      </>
    ),
  },
  stop: { box: 24, el: <Rect x={6.5} y={6.5} width={11} height={11} rx={2} fill="currentColor" stroke="none" /> },
  share: { box: 24, el: <Path d="M12 15V3.5M7.5 8L12 3.5 16.5 8M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5" /> },
  bolt: { box: 24, el: <Path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" /> },
  plus: { box: 24, el: <Path d="M12 5v14M5 12h14" /> },
  arrowRight: { box: 22, el: <Path d="M4 11h13M12 5.5L17.5 11 12 16.5" /> },
  chevronRight: { box: 20, el: <Path d="M7.5 4l6 6-6 6" /> },
  chevronLeft: { box: 20, el: <Path d="M12.5 4l-6 6 6 6" /> },
  close: { box: 20, el: <Path d="M5 5l10 10M15 5L5 15" /> },
  lock: {
    box: 16,
    el: (
      <>
        <Rect x={3} y={7} width={10} height={7} rx={2} />
        <Path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
      </>
    ),
  },
} satisfies Record<string, { box: number; el: ReactNode }>;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  /** In the icon's own viewBox units, as written in the design. */
  strokeWidth?: number;
};

export function Icon({ name, size = 22, color = Colors.ink, strokeWidth = 2 }: Props) {
  const icon = ICONS[name];
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${icon.box} ${icon.box}`}
      color={color}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      {icon.el}
    </Svg>
  );
}
