// Scorer for contrast (contrast sensitivity), both eyes together.
// Mobile: { letters: [{ letter, color, contrast }], faintestSeen, noneSeen }. Web: { shades: ["#111111", …], faintestSeen }.
import { arr, num, type Answers, type Scored } from './helpers';

/** Weber contrast of an sRGB grey on white (same formula as the mobile app). */
function contrastOnWhite(hex: string) {
  const v = parseInt(hex.replace('#', '').slice(0, 2), 16) / 255;
  if (!Number.isFinite(v)) return null;
  const linear = v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  return 1 - linear;
}

export function scoreContrast(answers: Answers): Scored {
  const letters = arr<{ contrast?: unknown; color?: unknown }>(answers.letters).filter((l) => l && typeof l === 'object');
  const levels = letters.length
    ? letters.map((l) => num(l.contrast) ?? contrastOnWhite(String(l.color)) ?? 1)
    : arr<string>(answers.shades).map((s) => contrastOnWhite(String(s)) ?? 1);
  const index = num(answers.faintestSeen);
  const seen = answers.noneSeen === true || index === undefined ? null : levels[index];

  if (seen == null)
    return {
      score: 0,
      status: 'see_doctor',
      summary: 'Could not see the letters',
      meaning: "You couldn't see any of the letters, even the dark ones. Please have an eye doctor check your vision.",
      tip: 'Book an eye exam soon and mention this result.',
    };

  // Log contrast sensitivity: 0 = only black letters, 1.2 = the faintest grey here (6%).
  const logCs = Math.log10(1 / Math.max(seen, 0.01));
  const score = logCs >= 1.1 ? 100 : logCs >= 0.85 ? 86 : logCs >= 0.55 ? 70 : logCs >= 0.3 ? 50 : logCs >= 0.1 ? 30 : 15;
  const status = score >= 85 ? 'good' : score >= 50 ? 'mild' : 'see_doctor';
  const detail = `Faintest seen: ${index! + 1} of ${levels.length} (${Math.round(seen * 100)}% contrast)`;
  if (status === 'good')
    return { score, status, summary: 'Sees faint letters well', meaning: `You spotted very faint letters, so your contrast vision looks healthy. ${detail}.` };
  if (status === 'mild')
    return {
      score,
      status,
      summary: 'Needs a little more contrast to see faint letters',
      meaning: `You need a little more contrast to spot faint letters. This often shows up first in dim light and at night. ${detail}.`,
      tip: 'Use brighter light for reading and mention this at your next eye test.',
    };
  return {
    score,
    status,
    summary: 'Needs strong contrast to see letters',
    meaning: `You only saw the darkest letters. Low contrast vision makes faces, steps and night driving harder and can be an early sign of cataract or other eye conditions. ${detail}.`,
    tip: 'Book an eye exam and mention this result.',
  };
}
