// Findings → LensSuggestion[] (best match first, at most 3), each with a reason.
// Suggestions only: an optician confirms the prescription and the lens.
import type { LensSuggestion, Profile, ScoredResult, TestId } from '@visus/shared';

import { COATINGS, LENSES, type LensKey } from './catalog';

type Coating = { name: string; reason: string };
type Input = { results: ScoredResult[]; profile: Pick<Profile, 'age' | 'isChild' | 'screenHoursPerDay' | 'wearsGlasses'>; intake: string };

export function recommendLenses({ results, profile, intake }: Input): LensSuggestion[] {
  const status = (id: TestId) => results.find((r) => r.testId === id)?.status;
  const notGood = (...ids: TestId[]) => ids.some((id) => status(id) && status(id) !== 'good');

  const child = profile.isChild || profile.age < 18;
  const presbyopic = profile.age >= 45 || (profile.age >= 38 && notGood('near_reading', 'near_point'));
  const distanceBlur = notGood('tumbling_e', 'kids_tumbling_e', 'clock_dial', 'duochrome');
  const nightGlare = notGood('glare_night', 'contrast') || /night|headlight|glare|halo|driv/i.test(intake);
  const screens = profile.screenHoursPerDay >= 4 || notGood('eye_strain');
  const outdoors = /sun|bright light|outdoor|squint|light sensitiv/i.test(intake);

  const hours = profile.screenHoursPerDay >= 4 ? `, for your ${Math.round(profile.screenHoursPerDay)}h of daily screen time` : '';
  const screenCoating: Coating[] = screens ? [{ ...COATINGS.blueGuard, reason: COATINGS.blueGuard.reason + hours }] : [];
  const coatings = (...extra: Coating[]) => [...extra, ...screenCoating, COATINGS.platinum].slice(0, 3);

  const picks: { key: LensKey; reason: string; coatings: Coating[] }[] = [];
  if (child) {
    if (distanceBlur)
      picks.push({ key: 'myoCare', reason: "Far-away detail looked soft. These lenses correct it and are designed to slow down short-sightedness as your child grows.", coatings: coatings() });
    picks.push({ key: 'smartLifeYoung', reason: 'Made for children: light, tough and sharp across the lens during busy school days.', coatings: coatings() });
  } else {
    if (nightGlare)
      picks.push({
        key: presbyopic ? 'driveSafeProgressive' : 'driveSafeSv',
        reason: 'You notice glare or blur at night. These lenses cut headlight glare and keep detail clear in low light.',
        coatings: coatings(COATINGS.driveSafe),
      });
    if (presbyopic)
      picks.push({ key: 'smartLifeProgressive', reason: 'One lens for far, middle and near: sharp reading up close without switching glasses.', coatings: coatings() });
    else if (screens && notGood('eye_strain', 'near_reading', 'near_point'))
      picks.push({ key: 'smartLifeDigital', reason: 'Extra support for close-up focus, so long hours on phone and laptop are less tiring.', coatings: coatings() });
    if (distanceBlur || picks.length === 0)
      picks.push({
        key: 'smartLifeSv',
        reason: distanceBlur
          ? 'Made for busy days that switch between your phone, people and the road, with sharp vision across the lens.'
          : 'Your vision looks good today. If you need glasses later, these suit days that switch between screens and the world around you.',
        coatings: coatings(),
      });
    if (outdoors || picks.length < 2)
      picks.push({ key: 'photoFusionX', reason: 'Clear indoors, dark in the sun within seconds, and full UV protection outdoors.', coatings: [COATINGS.platinum] });
  }

  const seen = new Set<string>();
  return picks
    .filter((p) => !seen.has(p.key) && seen.add(p.key))
    .slice(0, 3)
    .map((p) => ({ ...LENSES[p.key], reason: p.reason, coatings: p.coatings.map((c) => ({ name: c.name, reason: c.reason })) }));
}
