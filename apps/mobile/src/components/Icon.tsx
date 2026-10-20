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
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      {icon.el}
    </Svg>
  );
}
