// Scorers for colour_plates and kids_colour_shapes. Both: { plates: [{ plate, shown, answer }] }, plate 1 is a demo.
import { arr, type Answers, type Scored } from './helpers';

type Plate = { plate?: unknown; shown?: unknown; answer?: unknown };

function count(answers: Answers) {
  const plates = arr<Plate>(answers.plates);
  const demo = plates.find((p) => p.plate === 1) ?? plates[0];
  const test = plates.filter((p) => p !== demo);
  const right = test.filter((p) => p.answer != null && String(p.answer) === String(p.shown)).length;
  return { demoOk: !!demo && String(demo.answer) === String(demo.shown), right, total: test.length };
}

export function scoreColourPlates(answers: Answers): Scored {
  const { demoOk, right, total } = count(answers);
  const score = total ? Math.round((right / total) * 100) : 0;
  let status: Scored['status'] = right >= total - 1 ? 'good' : right >= total * 0.6 ? 'mild' : 'see_doctor';
  if (!demoOk && status === 'good') status = 'mild';
  const value = `${right} of ${total} plates`;
  const demoNote = demoOk ? '' : " You also missed the first plate, which everyone should read, so blur or screen brightness may have affected the test.";
  if (status === 'good')
    return { score, status, summary: `Read the colour plates (${value})`, meaning: 'You read the numbers on the plates, so your red-green colour vision looks normal.' };
  if (status === 'mild')
    return {
      score,
      status,
      summary: `Missed some colour plates (${value})`,
      meaning: `You missed a few of the red-green plates. This can be a mild red-green colour deficiency, which is common and usually present from birth.${demoNote}`,
      tip: 'Repeat the test with full screen brightness. An eye doctor can confirm colour vision with a full plate test.',
    };
  return {
    score,
    status,
    summary: `Missed many colour plates (${value})`,
    meaning: `You missed many of the red-green plates. This is a sign of red-green colour deficiency. It is common, especially in men, and usually present from birth.${demoNote}`,
    tip: 'An eye doctor can confirm it. If your colour vision has changed recently, see one soon.',
  };
}

export function scoreKidsColourShapes(answers: Answers): Scored {
  const { right, total } = count(answers);
  const score = total ? Math.round((right / total) * 100) : 0;
  const status = right >= total - 1 ? 'good' : right >= total - 2 ? 'mild' : 'see_doctor';
  const value = `${right} of ${total} shapes`;
  if (status === 'good') return { score, status, summary: `Found the hidden shapes (${value})`, meaning: 'Your child found the hidden shapes, so colour vision looks normal.' };
  return {
    score,
    status,
    summary: `Missed some hidden shapes (${value})`,
    meaning: 'Your child missed some of the shapes hidden in coloured dots. This can be a sign of colour deficiency, which is common and usually present from birth.',
    tip: 'Tell your child\'s eye doctor or school nurse. It helps teachers know which colours to avoid.',
  };
}
