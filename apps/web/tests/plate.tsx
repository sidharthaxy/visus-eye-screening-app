// Dot plates for the colour tests, using the design's algorithm: draw the figure on a
// hidden canvas, scatter non-overlapping dots, colour dots inside the figure from the
// figure palette and the rest from the background palette.

export type Dot = [x: number, y: number, r: number, fill: string];
export type Figure = { text: string } | { shape: "star" | "circle" | "square" | "none" };

const PALETTES = [
  { fg: ["#E07B39", "#E89048", "#D96A2E", "#EFA25C"], bg: ["#7F9A4E", "#93A85A", "#A9B46A", "#6E8C47", "#B9BC78"] },
  { fg: ["#E0689A", "#E87FA8", "#D45A8C", "#EC93B6"], bg: ["#8FA77A", "#A3B48C", "#7E9A6C", "#B3BE98", "#98AE84"] },
];

const S = 300;
const R = 148;

export function makePlate(figure: Figure, seed: number, palette = 0): Dot[] {
  const cv = document.createElement("canvas");
  cv.width = S;
  cv.height = S;
  const c = cv.getContext("2d", { willReadFrequently: true })!;
  c.fillStyle = "#000";
  c.strokeStyle = "#000";
  c.lineJoin = "round";
  if ("text" in figure) {
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-figtree") || "Arial";
    c.font = `800 ${figure.text.length > 1 ? 180 : 220}px ${family}, Arial, sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.lineWidth = 8;
    c.fillText(figure.text, S / 2, S / 2 + 8);
    c.strokeText(figure.text, S / 2, S / 2 + 8);
  } else if (figure.shape === "star") {
    c.beginPath();
    for (let k = 0; k < 10; k++) {
      const r = k % 2 ? 56 : 120;
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      c.lineTo(S / 2 + Math.cos(a) * r, S / 2 + 10 + Math.sin(a) * r);
    }
    c.closePath();
    c.fill();
    c.lineWidth = 8;
    c.stroke();
  } else if (figure.shape === "circle") {
    c.beginPath();
    c.arc(S / 2, S / 2, 92, 0, Math.PI * 2);
    c.fill();
  } else if (figure.shape === "square") {
    c.fillRect(S / 2 - 88, S / 2 - 88, 176, 176);
  }
  const px = c.getImageData(0, 0, S, S).data;
  const inside = (x: number, y: number) => px[(Math.round(y) * S + Math.round(x)) * 4 + 3] > 100;

  let s = seed;
  const rnd = () => (s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff) / 0x7fffffff;
  const P = PALETTES[palette % PALETTES.length];
  const dots: Dot[] = [];
  const N = 30000;
  const CELL = 14;
  const G = Math.ceil(S / CELL);
  const grid: [number, number, number][][] = Array.from({ length: G * G }, () => []);
  for (let k = 0; k < N && dots.length < 1500; k++) {
    const t = k / N;
    const r = Math.max(2.5, 6.5 - 4 * t - rnd() * 1.2);
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd()) * (R - r);
    const x = S / 2 + Math.cos(a) * d;
    const y = S / 2 + Math.sin(a) * d;
    const gx = Math.floor(x / CELL);
    const gy = Math.floor(y / CELL);
    let ok = true;
    for (let yy = gy - 1; yy <= gy + 1 && ok; yy++)
      for (let xx = gx - 1; xx <= gx + 1 && ok; xx++) {
        if (xx < 0 || yy < 0 || xx >= G || yy >= G) continue;
        for (const [px2, py2, pr] of grid[yy * G + xx]) {
          const m = pr + r + 0.8;
          if ((px2 - x) ** 2 + (py2 - y) ** 2 < m * m) {
            ok = false;
            break;
          }
        }
      }
    if (!ok) continue;
    grid[gy * G + gx].push([x, y, r]);
    const pal = inside(x, y) ? P.fg : P.bg;
    dots.push([x, y, r, pal[Math.floor(rnd() * pal.length)]]);
  }
  return dots;
}

export function PlateSvg({ dots, size = 300 }: { dots: Dot[]; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 300 300" className="block max-w-full" role="img" aria-label="Dot plate">
      {dots.map((d, i) => (
        <circle key={i} cx={d[0].toFixed(1)} cy={d[1].toFixed(1)} r={d[2].toFixed(1)} fill={d[3]} />
      ))}
    </svg>
  );
}
