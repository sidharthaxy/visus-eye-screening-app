// Dot plates for Colour vision (33) and Kids colour shapes (35), made the
// same way as the design: packed dots of different sizes, coloured from one
// palette inside a hidden figure and another outside it. The design draws the
// figure on a canvas; React Native has none, so figures are maths here:
// digits are thick strokes, shapes are polygons and circles.
//
// These plates are for screening only. They are not calibrated Ishihara plates.

export type Dot = { x: number; y: number; r: number; color: string };
export type Figure = { kind: 'number'; value: string } | { kind: 'shape'; value: 'star' | 'circle' | 'square' | 'nothing' };
export type Palette = { fg: string[]; bg: string[] };

/** Plate drawing space: 300 × 300, dots inside a circle of radius 148. */
export const PLATE = 300;
const R = 148;

type Pt = [number, number];

/** Digits as polylines in a 100 × 160 box, drawn with a 32-wide round stroke. */
const ellipse = (cx: number, cy: number, rx: number, ry: number): Pt[] =>
  Array.from({ length: 25 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  });

const DIGITS: Record<string, Pt[][]> = {
  '0': [ellipse(50, 80, 36, 62)],
  '1': [[[30, 40], [55, 18], [55, 142]]],
  '2': [[[18, 48], [28, 26], [50, 18], [72, 26], [82, 48], [76, 70], [18, 142], [84, 142]]],
  '3': [[[18, 30], [40, 18], [66, 20], [80, 40], [74, 62], [50, 76], [76, 88], [84, 112], [72, 136], [48, 144], [18, 132]]],
  '4': [[[70, 142], [70, 18], [14, 104], [88, 104]]],
  '5': [[[80, 18], [26, 18], [20, 72], [50, 64], [74, 76], [84, 104], [74, 132], [48, 144], [18, 134]]],
  '6': [[[74, 22], [50, 18], [28, 32], [18, 70], [18, 104], [28, 132], [50, 144], [72, 134], [82, 108], [72, 84], [50, 76], [28, 84], [18, 104]]],
  '7': [[[14, 18], [86, 18], [40, 142]]],
  '8': [ellipse(50, 48, 28, 30), ellipse(50, 110, 34, 34)],
  '9': [[[26, 138], [50, 142], [72, 128], [82, 90], [82, 56], [72, 28], [50, 16], [28, 26], [18, 52], [28, 76], [50, 84], [72, 76], [82, 56]]],
};
const DIGIT_STROKE = 32;

function distToSegment([px, py]: Pt, [ax, ay]: Pt, [bx, by]: Pt) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Whether a point (plate space) is inside the hidden figure. */
function insideTest(figure: Figure): (p: Pt) => boolean {
  const c = PLATE / 2;
  if (figure.kind === 'number') {
    // Digits 180 high, side by side with a small gap, centred on the plate.
    const scale = 180 / 160;
    const width = figure.value.length * 100 * scale + (figure.value.length - 1) * 10;
    const strokes = [...figure.value].flatMap((d, i) =>
      DIGITS[d].map((line) =>
        line.map(([x, y]): Pt => [c - width / 2 + i * (100 * scale + 10) + x * scale, c - 90 + y * scale]),
      ),
    );
    const half = (DIGIT_STROKE * scale) / 2;
    return (p) => strokes.some((line) => line.some((a, i) => i > 0 && distToSegment(p, line[i - 1], a) <= half));
  }
  switch (figure.value) {
    case 'star': {
      const star: Pt[] = Array.from({ length: 10 }, (_, k) => {
        const r = k % 2 ? 56 : 120;
        const a = -Math.PI / 2 + (k * Math.PI) / 5;
        return [c + Math.cos(a) * r, c + 10 + Math.sin(a) * r];
      });
      return (p) => inPolygon(p, star);
    }
    case 'circle':
      return ([x, y]) => Math.hypot(x - c, y - c) <= 92;
    case 'square':
      return ([x, y]) => Math.abs(x - c) <= 80 && Math.abs(y - c) <= 80;
    default:
      return () => false;
  }
}

function inPolygon([x, y]: Pt, poly: Pt[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Packs up to 1500 non-overlapping dots, big first, like the design. Same seed → same plate. */
export function makePlate(figure: Figure, palette: Palette, seed: number): Dot[] {
  let s = seed;
  const rnd = () => (s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff) / 0x7fffffff;
  const inside = insideTest(figure);
  const CELL = 14;
  const G = Math.ceil(PLATE / CELL);
  const grid: [number, number, number][][] = Array.from({ length: G * G }, () => []);
  const dots: Dot[] = [];
  const N = 30000;
  for (let k = 0; k < N && dots.length < 1500; k++) {
    const r = Math.max(2.5, 6.5 - (4 * k) / N - rnd() * 1.2);
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd()) * (R - r);
    const x = PLATE / 2 + Math.cos(a) * d;
    const y = PLATE / 2 + Math.sin(a) * d;
    const gx = Math.floor(x / CELL);
    const gy = Math.floor(y / CELL);
    let free = true;
    for (let yy = gy - 1; yy <= gy + 1 && free; yy++) {
      for (let xx = gx - 1; xx <= gx + 1 && free; xx++) {
        if (xx < 0 || yy < 0 || xx >= G || yy >= G) continue;
        for (const [px, py, pr] of grid[yy * G + xx]) {
          const m = pr + r + 0.8;
          if ((px - x) ** 2 + (py - y) ** 2 < m * m) {
            free = false;
            break;
          }
        }
      }
    }
    if (!free) continue;
    grid[gy * G + gx].push([x, y, r]);
    const colors = inside([x, y]) ? palette.fg : palette.bg;
    dots.push({ x, y, r, color: colors[Math.floor(rnd() * colors.length)] });
  }
  return dots;
}

/** Red–green confusion colours from the design (orange figure on olive green). */
export const RED_GREEN: Palette = {
  fg: ['#E07B39', '#E89048', '#D96A2E', '#EFA25C'],
  bg: ['#7F9A4E', '#93A85A', '#A9B46A', '#6E8C47', '#B9BC78'],
};
/** Kids palette from the design (pink figure on sage green). */
export const PINK_GREEN: Palette = {
  fg: ['#E0689A', '#E87FA8', '#D45A8C', '#EC93B6'],
  bg: ['#8FA77A', '#A3B48C', '#7E9A6C', '#B3BE98', '#98AE84'],
};
/** Demo plate everyone should read: orange on blue-grey, no red–green confusion. */
export const DEMO: Palette = {
  fg: ['#E07B39', '#E89048', '#D96A2E', '#EFA25C'],
  bg: ['#7D8FA8', '#8C9DB4', '#6F829C', '#9AA9BE', '#8295AE'],
};
