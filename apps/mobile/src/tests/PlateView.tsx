import { memo, useMemo } from 'react';
import Svg, { Circle } from 'react-native-svg';

import { makePlate, PLATE, type Figure, type Palette } from '@/tests/plates';

type Props = { figure: Figure; palette: Palette; seed: number; size: number };

/** One dot plate, drawn at `size` points. */
export const PlateView = memo(function PlateView({ figure, palette, seed, size }: Props) {
  const dots = useMemo(() => makePlate(figure, palette, seed), [figure, palette, seed]);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${PLATE} ${PLATE}`}>
      {dots.map((d, i) => (
        <Circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.color} />
      ))}
    </Svg>
  );
});
