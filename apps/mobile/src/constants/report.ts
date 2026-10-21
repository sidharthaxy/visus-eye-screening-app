// Plain-text reports for the share sheet, until Share report (20) exists.
import type { Status, Verdict } from '@visus/shared';

import { StatusColors } from '@/constants/theme';
import { CATEGORIES, testInfo } from '@/constants/tests';

export type Lens = Verdict['lens'][number];

const ORDER: Record<Status, number> = { see_doctor: 0, mild: 1, good: 2 };

/** Results that need attention, worst first. */
export const findingsOf = (verdict: Verdict) =>
  verdict.results.filter((r) => r.status !== 'good').sort((a, b) => ORDER[a.status] - ORDER[b.status]);

/** The categories checked today, in library order, with their status. */
export const areasOf = (verdict: Verdict) =>
  CATEGORIES.flatMap((c) => {
    const status = verdict.areas[c.id];
    return status ? [{ ...c, status }] : [];
  });

export function resultsReport(verdict: Verdict) {
  return [
    `Visus eye check, ${new Date().toLocaleDateString()}`,
    `${verdict.headline}. ${verdict.advice}`,
    '',
    ...areasOf(verdict).map((a) => `${a.tile}: ${StatusColors[a.status].label}`),
    '',
    ...verdict.results.map((r) => `${testInfo(r.testId)?.name}: ${r.summary} (${StatusColors[r.status].label})`),
    '',
    'This is a screening, not a diagnosis.',
  ].join('\n');
}

export function lensReport(lens: Lens) {
  return [
    'Visus lens suggestion',
    `${lens.product} (${lens.lensType})`,
    lens.reason,
    ...lens.coatings.map((c) => `Coating: ${c.name}, ${c.reason.charAt(0).toLowerCase()}${c.reason.slice(1)}`),
    'Your optician will confirm the final prescription and lens.',
  ].join('\n');
}
