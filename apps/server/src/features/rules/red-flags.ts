// Decide if a scored result is a red flag: something to see an eye doctor about soon.
// Red flags come only from these rules, never from the AI alone.
import type { ScoredResult } from '@visus/shared';

type Side = 'right' | 'left';

/** Sides whose eye result matches `test`, as "right eye" / "left eye" / "both eyes". */
function sides(result: ScoredResult, test: (e: NonNullable<ScoredResult['eyes']>[Side]) => boolean) {
  const list = (['right', 'left'] as Side[]).filter((s) => result.eyes?.[s] && test(result.eyes[s]));
  return list.length === 2 ? 'both eyes' : list.length === 1 ? `${list[0]} eye` : null;
}

/** The finding to show on the Red-flag screen (15), or null. */
export function redFlag(result: ScoredResult, answers: Record<string, unknown>): string | null {
  switch (result.testId) {
    case 'amsler': {
      if (result.status !== 'see_doctor') return null;
      const which = sides(result, (e) => e?.status === 'see_doctor');
      const centre = Object.values(result.eyes ?? {}).some((e) => e?.detail?.includes('centre') && e.status === 'see_doctor');
      return `Wavy or missing lines${centre ? ' near the centre' : ''}${which ? `, ${which}` : ''}`;
    }
    case 'peripheral_field': {
      // A third of the dots (8 of 24) missed by one eye.
      const which = sides(result, (e) => !!e && e.score <= 67);
      return which ? `Missed many dots at the side, ${which}` : null;
    }
    case 'tumbling_e':
    case 'kids_tumbling_e': {
      // Without glasses, low vision is expected for many people (glasses check round 1).
      if (answers.round === 'glasses_off') return null;
      const which = sides(result, (e) => e?.value === 'Below 20/200');
      return which ? `Very low vision, ${which}` : null;
    }
    case 'contrast':
      return result.score === 0 ? 'Could not see the letters, even the dark ones' : null;
    default:
      return null;
  }
}

/** Words in the intake that need a doctor first. The plan summary warns about them. */
const URGENT: [RegExp, string][] = [
  [/flash(es)?|floater/i, 'flashes or floaters'],
  [/curtain|shadow over|veil/i, 'a shadow over your vision'],
  [/sudden(ly)?|overnight/i, 'a sudden change'],
  [/pain|hurts|aching eye/i, 'eye pain'],
  [/double vision|seeing double/i, 'double vision'],
  [/red eye|redness/i, 'a red eye'],
];

/** Intake answers like "Pain, redness or flashes: No" are not complaints. */
export function intakeRedFlag(intake: string): string | null {
  const text = intake.replace(/Pain, redness or flashes:\s*(No|None)[^\n]*/gi, '').replace(/Pain, redness or flashes:/gi, '');
  const found = URGENT.filter(([re]) => re.test(text)).map(([, label]) => label);
  return found.length ? found.join(', ') : null;
}
