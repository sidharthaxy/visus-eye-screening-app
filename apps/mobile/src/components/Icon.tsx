// Line icons from the design, normalised to a 24×24 viewBox.
import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';

const ICONS = {
  home: (
    <>
      <Path d="M3.5 11L12 4l8.5 7" />
      <Path d="M6 9.5V20h12V9.5" />
    </>
  ),
  eye: (
    <>
      <Path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" />
      <Circle cx={12} cy={12} r={3} />
    </>
  ),
  results: <Path d="M3.5 20.5h17M6.5 17v-5M12 17V6M17.5 17V9" />,
  profile: (
    <>
      <Circle cx={12} cy={8.5} r={4} />
      <Path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6" />
    </>
  ),
  chevronRight: <Path d="M9 4.8l7.2 7.2-7.2 7.2" />,
  chevronLeft: <Path d="M15 4.8L7.8 12l7.2 7.2" />,
  arrowRight: <Path d="M4 12h15M13 6l6 6-6 6" />,
  close: <Path d="M6 6l12 12M18 6L6 18" />,
  plus: <Path d="M12 5v14M5 12h14" />,
  bolt: <Path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" />,
  lock: (
    <>
      <Rect x={4.5} y={10.5} width={15} height={10.5} rx={3} />
      <Path d="M8.25 10.5V7.5a3.75 3.75 0 0 1 7.5 0v3" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 22, color = Colors.ink, strokeWidth = 2 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      {ICONS[name]}
    </Svg>
  );
}
