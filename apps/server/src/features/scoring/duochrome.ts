// Scorer for duochrome (red-green focus test). Per eye: { clearer: "red" | "green" | "same" }.
import type { Eye } from '@visus/shared';

import { eachEyeSummary, scoreEachEye, type Answers, type Scored } from './helpers';

export function scoreDuochrome(answers: Answers, eye: Eye): Scored {
  const { eyes, score, status, result } = scoreEachEye(answers, eye, (a) =>
    a.clearer === 'red'
      ? { value: 'Red clearer', score: 70, status: 'mild', note: 'red' }
      : a.clearer === 'green'
        ? { value: 'Green clearer', score: 70, status: 'mild', note: 'green' }
        : { value: 'Same', score: 92, status: 'good' },
  );
  if (status === 'good')
    return { score, status, summary: 'Focus looks balanced', eyes: result, meaning: 'Letters looked equally sharp on red and green, so your focus looks right.' };
  const notes = Object.values(eyes).map((e) => e?.note);
  const meaning = [
    notes.includes('red') && 'Red looked clearer: your eye may focus a little short (slight short-sightedness), or your glasses may be too weak.',
    notes.includes('green') && 'Green looked clearer: your eye may focus a little long, or your glasses may be a little too strong.',
  ]
    .filter(Boolean)
    .join(' ');
  return {
    score,
    status,
    summary: `Focus may be a little off: ${eachEyeSummary(eyes)}`,
    eyes: result,
    meaning,
    tip: 'An optician can fine-tune your prescription in a few minutes.',
  };
}
