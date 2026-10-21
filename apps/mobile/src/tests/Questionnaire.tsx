// Screens 36–38: the questionnaires (Eye risk screener, Eye strain, Glare &
// night vision). One question at a time; picking an answer moves on.
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Button } from '@/components/Button';
import { TestHeader } from '@/components/TestHeader';
import { Text } from '@/components/Text';
import { Colors, Fonts } from '@/constants/theme';
import type { TestProps } from '@/tests/parts';

type Config = {
  title: string;
  questions: { q: string; help?: string }[];
  options: string[];
  /** Same help line under every question. */
  help?: string;
  /** Option buttons show a 3-bar "how often" meter. */
  meter?: boolean;
  /** Night road picture above the question. */
  night?: boolean;
};

const FREQUENCY = ['Never', 'Sometimes', 'Often', 'Always'];

export const RISK_SCREENER: Config = {
  title: 'Eye risk screener',
  options: ['Yes', 'No', 'Not sure'],
  questions: [
    { q: 'Has anyone in your family had glaucoma?', help: 'It often runs in families.' },
    { q: 'Do you have diabetes?', help: 'Diabetes can affect the tiny blood vessels in your eyes.' },
    { q: 'Do you have high blood pressure?', help: 'It can strain the blood vessels at the back of the eye.' },
    { q: 'Have you ever had an eye injury or surgery?', help: 'Including laser treatment or cataract surgery.' },
    { q: 'Do you smoke?', help: 'Smoking raises the risk of several eye conditions.' },
  ],
};

export const EYE_STRAIN: Config = {
  title: 'Eye strain',
  options: FREQUENCY,
  meter: true,
  help: 'Think about the last two weeks.',
  questions: [
    { q: 'Do your eyes feel tired by the end of the day?' },
    { q: 'Do you get headaches after screen use?' },
    { q: 'Do your eyes burn after screen use?' },
    { q: 'Do your eyes feel dry or gritty?' },
    { q: 'Does your vision blur when you look up from a screen?' },
    { q: 'Do you rub your eyes often?' },
  ],
};

export const GLARE_NIGHT: Config = {
  title: 'Glare & night vision',
  options: FREQUENCY,
  meter: true,
  night: true,
  questions: [
    { q: 'Do headlights cause halos or glare at night?' },
    { q: 'Is it harder to read road signs after dark?' },
    { q: 'Do you avoid driving at night?' },
    { q: 'Do bright lights make you squint or look away?' },
    { q: 'Do your eyes take long to adjust to the dark?' },
  ],
};

export function Questionnaire({ config, onExit, onDone }: TestProps & { config: Config }) {
  const { questions, options } = config;
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<(number | undefined)[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const question = questions[index];
  const current = picked[index];

  function pick(k: number) {
    const next = [...picked];
    next[index] = k;
    setPicked(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (index < questions.length - 1) setIndex(index + 1);
      else
        onDone({
          answers: questions.map((item, i) => ({ question: item.q, answer: options[next[i] ?? 0], index: next[i] ?? 0 })),
        });
    }, 380);
  }

  return (
    <View style={styles.root}>
      <TestHeader title={config.title} onExit={onExit} />

      <View style={styles.segments}>
        {questions.map((_, k) => (
          <View key={k} style={[styles.segment, { backgroundColor: k <= index ? Colors.ink : Colors.borderOption }]} />
        ))}
      </View>
      <Text style={styles.count}>
        Question {index + 1} of {questions.length}
      </Text>

      {config.night && <NightRoad />}
      <Text style={[styles.question, config.night && styles.questionAfterArt]}>{question.q}</Text>
      {(question.help ?? config.help) && <Text style={styles.help}>{question.help ?? config.help}</Text>}

      <View style={styles.spacer} />
      <View style={[styles.options, config.meter && styles.optionsTight]}>
        {options.map((label, k) => {
          const on = current === k;
          const fill = on ? Colors.white : Colors.ink;
          const empty = on ? 'rgba(255,255,255,0.28)' : Colors.borderOption;
          return (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => pick(k)}
              style={({ pressed }) => [
                config.meter ? styles.meterOption : styles.option,
                on && styles.on,
                pressed && styles.pressed,
              ]}>
              <Text style={[config.meter ? styles.meterLabel : styles.label, on && styles.onText]}>{label}</Text>
              {config.meter && (
                <View style={styles.meter}>
                  {[7, 11, 16].map((h, bar) => (
                    <View key={h} style={[styles.bar, { height: h, backgroundColor: k > bar ? fill : empty }]} />
                  ))}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
      <Button
        title="Previous question"
        variant="ghost"
        onPress={() => {
          clearTimeout(timer.current);
          setIndex(Math.max(0, index - 1));
        }}
        style={[styles.previous, index === 0 && styles.hidden]}
      />
    </View>
  );
}

/** Two headlights on a dark road, for Glare & night vision. */
function NightRoad() {
  return (
    <View style={styles.night}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#17191F" />
            <Stop offset="1" stopColor="#262A33" />
          </LinearGradient>
          <RadialGradient id="light" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFF6DD" />
            <Stop offset="0.17" stopColor="#FFF6DD" />
            <Stop offset="0.24" stopColor="#FFECBE" stopOpacity={0.55} />
            <Stop offset="1" stopColor="#FFECBE" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#sky)" />
        <Rect x="36%" y="57%" width={92} height={92} fill="url(#light)" transform="translate(-46 -46)" />
        <Rect x="64%" y="57%" width={92} height={92} fill="url(#light)" transform="translate(-46 -46)" />
      </Svg>
      <View style={styles.lane} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  segments: { marginTop: 16, flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 6, borderRadius: 99 },
  count: { marginTop: 12, fontFamily: Fonts.semibold, fontSize: 14, color: Colors.muted },
  question: { marginTop: 8, fontFamily: Fonts.bold, fontSize: 30, lineHeight: 35, letterSpacing: -0.75, color: Colors.ink },
  questionAfterArt: { marginTop: 20 },
  help: { marginTop: 10, fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, color: Colors.muted },
  spacer: { flex: 1, minHeight: 16 },
  options: { gap: 12 },
  optionsTight: { gap: 10 },
  option: {
    height: 72,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderOption,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: Fonts.semibold, fontSize: 20, color: Colors.ink },
  meterOption: {
    height: 64,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderOption,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meterLabel: { fontFamily: Fonts.semibold, fontSize: 18, color: Colors.ink },
  meter: { height: 16, flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { width: 4, borderRadius: 2 },
  on: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  onText: { color: Colors.white },
  pressed: { transform: [{ scale: 0.98 }] },
  previous: { marginTop: 6 },
  hidden: { opacity: 0 },
  night: { marginTop: 14, height: 150, borderRadius: 22, overflow: 'hidden' },
  lane: {
    position: 'absolute',
    left: '50%',
    bottom: 0,
    width: 4,
    height: 34,
    marginLeft: -2,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
});
