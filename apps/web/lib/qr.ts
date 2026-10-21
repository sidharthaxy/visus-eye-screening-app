// Minimal QR code encoder: byte mode, error correction L, versions 1–5 (up to 106 bytes).
// Enough for a share link. Follows the structure of Nayuki's reference implementation.

const DATA_CODEWORDS = [0, 19, 34, 55, 80, 108];
const EC_CODEWORDS = [0, 7, 10, 15, 20, 26];

function gfMul(x: number, y: number) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function rsDivisor(degree: number) {
  const result = Array(degree - 1).fill(0).concat(1);
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = gfMul(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = gfMul(root, 2);
  }
  return result;
}

function rsRemainder(data: number[], divisor: number[]) {
  const result = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ (result.shift() as number);
    result.push(0);
    divisor.forEach((coef, i) => (result[i] ^= gfMul(coef, factor)));
  }
  return result;
}

/** Returns the module grid (true = dark), or null if the text is too long. */
export function qrMatrix(text: string): boolean[][] | null {
  const bytes = Array.from(new TextEncoder().encode(text));
  const version = DATA_CODEWORDS.findIndex((cap, v) => v > 0 && 4 + 8 + bytes.length * 8 <= cap * 8);
  if (version < 1) return null;

  // Data bits: mode, length, bytes, terminator, padding.
  const bits: number[] = [];
  const push = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };
  push(0b0100, 4);
  push(bytes.length, 8);
  bytes.forEach((b) => push(b, 8));
  const capBits = DATA_CODEWORDS[version] * 8;
  push(0, Math.min(4, capBits - bits.length));
  push(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capBits; pad ^= 0xec ^ 0x11) push(pad, 8);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));
  const codewords = data.concat(rsRemainder(data, rsDivisor(EC_CODEWORDS[version])));

  const size = version * 4 + 17;
  const m = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const fn = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const set = (x: number, y: number, dark: boolean) => {
    m[y][x] = dark;
    fn[y][x] = true;
  };

  for (let i = 0; i < size; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        set(x, y, d !== 2 && d !== 4);
      }
  }
  if (version > 1) {
    const p = size - 7;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(p + dx, p + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }

  // Format bits: level L (01), mask 0.
  const fmt = 0b01 << 3;
  let rem = fmt;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const f = ((fmt << 10) | rem) ^ 0x5412;
  const bit = (i: number) => ((f >>> i) & 1) === 1;
  for (let i = 0; i <= 5; i++) set(8, i, bit(i));
  set(8, 7, bit(6));
  set(8, 8, bit(7));
  set(7, 8, bit(8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
  for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
  set(8, size - 8, true);

  // Data in the zigzag order, with mask 0 ((x + y) even → flip).
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (fn[y][x]) continue;
        const dark = i < codewords.length * 8 ? ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) === 1 : false;
        i++;
        m[y][x] = dark !== ((x + y) % 2 === 0);
      }
    }
  }
  return m;
}

/** SVG path for the dark modules, one unit per module. */
export function qrPath(text: string) {
  const m = qrMatrix(text);
  if (!m) return { size: 0, d: "" };
  let d = "";
  m.forEach((row, y) => row.forEach((dark, x) => dark && (d += `M${x} ${y}h1v1h-1z`)));
  return { size: m.length, d };
}
