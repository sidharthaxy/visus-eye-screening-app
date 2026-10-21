// Plain-text reports for the share sheet, until Share report (20) exists.
import type { Status, Verdict } from '@visus/shared';

import { StatusColors } from '@/constants/theme';
import { CATEGORIES, testInfo } from '@/constants/tests';

export type Lens = Verdict['lens'][number];

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** "Today", or "12 Oct" for an earlier day. */
export function dayLabel(iso: string | undefined) {
  const date = iso ? new Date(iso) : new Date();
  return sameDay(date, new Date()) ? 'Today' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const DAY = 86_400_000;

/** "Today", "Yesterday", "9 days ago". */
export function daysAgo(iso: string) {
  const n = Math.floor((Date.now() - new Date(iso).getTime()) / DAY);
  return n <= 0 ? 'Today' : n === 1 ? 'Yesterday' : `${n} days ago`;
}

/** Days since a date. */
export const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / DAY);

/** The Re-check reminder (56) shows when the last check is this old. */
export const RECHECK_DAYS = 90;

/** "a month", "3 months". */
export function elapsed(iso: string) {
  const months = Math.floor(daysSince(iso) / 30);
  return months <= 1 ? 'a month' : `${months} months`;
}

/** "19 Oct 2026". */
export const fullDate = (iso: string | undefined) =>
  (iso ? new Date(iso) : new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

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

const ACUITY = ['tumbling_e', 'kids_tumbling_e'];

/** "Left eye: 20/30, wavy lines near the centre on Amsler grid" for each eye with per-eye results. */
export function eyeLines(verdict: Verdict) {
  return (['left', 'right'] as const).flatMap((side) => {
    const acuity = verdict.results.find((r) => ACUITY.includes(r.testId))?.eyes?.[side]?.value;
    const notes = verdict.results.flatMap((r) => {
      const e = r.eyes?.[side];
      if (!e || e.status === 'good' || ACUITY.includes(r.testId)) return [];
      const what = e.detail ?? e.value;
      return [`${what.charAt(0).toLowerCase()}${what.slice(1)} on ${testInfo(r.testId)?.name}`];
    });
    if (!acuity && notes.length === 0) return [];
    const parts = [acuity, ...notes, notes.length ? undefined : 'no problems found'].filter(Boolean);
    return [`${side === 'left' ? 'Left' : 'Right'} eye: ${parts.join(', ')}`];
  });
}

/** Plain-text report, for WhatsApp and the PDF. */
export function resultsReport(verdict: Verdict, link?: string) {
  return [
    `Visus eye check, ${fullDate(verdict.date)}`,
    `${verdict.headline}. ${verdict.advice}`,
    '',
    ...areasOf(verdict).map((a) => `${a.tile}: ${StatusColors[a.status].label}`),
    ...eyeLines(verdict),
    '',
    ...verdict.results.map((r) => `${testInfo(r.testId)?.name}: ${r.summary} (${StatusColors[r.status].label})`),
    '',
    'This is a screening, not a diagnosis.',
    ...(link ? ['', `Full report (link valid for 24 hours): ${link}`] : []),
  ].join('\n');
}
