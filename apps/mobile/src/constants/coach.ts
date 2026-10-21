// Helpers for the Screen Coach screens (7, 23).

/** 252 → "4h 12m" */
export const hm = (min: number) => `${Math.floor(min / 60)}h ${Math.round(min % 60)}m`;

/** "2026-10-22" as a local date. */
export const dayDate = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** "2026-10-22" → "W" */
export const dayLetter = (date: string) => dayDate(date).toLocaleDateString('en-GB', { weekday: 'narrow' });
