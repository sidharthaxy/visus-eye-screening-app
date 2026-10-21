// Scorers for risk_screener, eye_strain and glare_night: { answers: [{ question, answer, index? }] }.
// The web app sends no index, so it is found from the answer text.
import { arr, clamp, plural, type Answers, type Scored } from './helpers';

type Answer = { question?: unknown; answer?: unknown; index?: unknown };
const FREQUENCY = ['never', 'sometimes', 'often', 'always'];
const RISK = ['yes', 'no', 'not sure'];

const indexOf = (a: Answer, options: string[]) =>
  typeof a.index === 'number' ? a.index : Math.max(0, options.indexOf(String(a.answer ?? '').toLowerCase()));

const RISK_FACTORS: [RegExp, string][] = [
  [/glaucoma/i, 'family history of glaucoma'],
  [/diabetes/i, 'diabetes'],
  [/blood pressure/i, 'high blood pressure'],
  [/injury|surgery/i, 'past eye injury or surgery'],
  [/smoke/i, 'smoking'],
];

export function scoreRiskScreener(answers: Answers): Scored {
  const list = arr<Answer>(answers.answers);
  const yes = list.filter((a) => indexOf(a, RISK) === 0);
  const unsure = list.filter((a) => indexOf(a, RISK) === 2).length;
  const score = clamp(100 - yes.length * 20 - unsure * 10);
  const status = yes.length === 0 && unsure <= 1 ? 'good' : yes.length >= 3 ? 'see_doctor' : 'mild';
  const factors = yes.map((a) => RISK_FACTORS.find(([re]) => re.test(String(a.question)))?.[1]).filter(Boolean) as string[];
  const diabetes = factors.includes('diabetes');
  if (status === 'good') return { score, status, summary: 'No major risk factors', meaning: 'None of the common risk factors for eye disease apply to you.', tip: 'A full eye exam every 2 years keeps it that way.' };
  return {
    score,
    status,
    summary: yes.length ? plural(yes.length, 'risk factor') : 'A few unsure answers',
    meaning: `${factors.length ? `You mentioned ${factors.join(', ')}. ` : ''}These raise the chance of eye problems that start without symptoms, like glaucoma or diabetic eye disease. Regular full eye exams catch them early.`,
    tip: diabetes ? 'With diabetes, have a dilated eye exam every year.' : status === 'see_doctor' ? 'Book a full eye exam with an eye doctor this year.' : 'Have a full eye exam every year.',
  };
}

function frequencyScore(answers: Answers) {
  const list = arr<Answer>(answers.answers);
  const points = list.reduce((n, a) => n + Math.min(3, indexOf(a, FREQUENCY)), 0);
  const score = list.length ? clamp(100 - (points / (list.length * 3)) * 100) : 0;
  return { score, status: score >= 75 ? 'good' : score >= 45 ? 'mild' : ('see_doctor' as Scored['status']) };
}

export function scoreEyeStrain(answers: Answers): Scored {
  const { score, status } = frequencyScore(answers);
  if (status === 'good') return { score, status, summary: 'Eyes feel comfortable', meaning: 'You rarely get tired, dry or sore eyes, even after screen time.' };
  return {
    score,
    status,
    summary: status === 'mild' ? 'Tired eyes after screens' : 'Strong signs of eye strain',
    meaning:
      status === 'mild'
        ? 'Your eyes often feel dry or tired after screen time, a common sign of digital eye strain.'
        : 'Your eyes feel tired, dry or sore most of the time. Constant strain can also come from an out-of-date prescription.',
    tip: status === 'mild' ? 'Every 20 minutes, look at something 6 metres away for 20 seconds.' : 'Book an eye test, and take a 20-second break from screens every 20 minutes.',
  };
}

export function scoreGlareNight(answers: Answers): Scored {
  const { score, status } = frequencyScore(answers);
  if (status === 'good') return { score, status, summary: 'Little trouble with glare', meaning: 'Headlights and bright lights rarely bother you, and you see well after dark.' };
  return {
    score,
    status,
    summary: status === 'mild' ? 'Glare from lights at night' : 'Strong glare and night vision trouble',
    meaning:
      status === 'mild'
        ? 'Headlights and street lights often dazzle you, which makes night driving harder.'
        : 'Glare and darkness bother you most of the time. This makes night driving unsafe and can be an early sign of cataract.',
    tip: status === 'mild' ? 'Anti-reflective lenses made for driving can cut glare at night.' : 'See an eye doctor before driving at night again.',
  };
}
