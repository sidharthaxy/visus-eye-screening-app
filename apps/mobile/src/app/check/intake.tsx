import { TEST_CATALOG } from '@visus/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text, TextInput } from '@/components/Text';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { listProfiles } from '@/services/profiles';
import { createSession, type Session } from '@/services/sessions';
import { useCheck } from '@/store/check';

/** Follow-up questions after the user describes the problem. */
const QUESTIONS: [string, string, string[]][] = [
  ['Is it in both eyes, or one more than the other?', 'Eyes', ['Both eyes', 'Mostly left', 'Mostly right']],
  ['How long has it been happening?', 'How long', ['A few days', 'A few weeks', 'Months or more']],
  ['Any pain, redness or flashes of light?', 'Pain, redness or flashes', ['None of those', 'Some discomfort', 'Yes, flashes']],
];

type Message = { from: 'ai' | 'me'; text: string; chips?: string[]; cta?: boolean };

const minutes = (s: Session) =>
  s.plan.reduce((sum, p) => sum + (TEST_CATALOG.find((t) => t.id === p.testId)?.minutes ?? 0), 0);

/** Screen 9: Issue intake. */
export default function Intake() {
  const insets = useSafeAreaInsets();
  const start = useCheck((s) => s.start);
  const scroll = useRef<ScrollView>(null);

  const [name, setName] = useState('');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [complaint, setComplaint] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [failed, setFailed] = useState(false);
  const [text, setText] = useState('');

  // Whose check (Who is this for); the account owner by default.
  const params = useLocalSearchParams<{ profileId?: string }>();
  useEffect(() => {
    listProfiles().then((all) => {
      const p = all.find((x) => x.id === params.profileId) ?? all[0];
      setName(p.name.split(' ')[0]);
      setProfileId(p.id);
    });
  }, [params.profileId]);

  const allAnswered = answers.length === QUESTIONS.length;
  const done = allAnswered && !typing;

  async function plan(all: string[]) {
    setFailed(false);
    setTyping(true);
    const intake = [complaint, ...QUESTIONS.map(([, label], i) => `${label}: ${all[i]}`)].join('\n');
    try {
      const s = await createSession({ profileId: profileId ?? 'me', intake, mode: 'full' });
      start('full', s);
      setSession(s);
    } catch {
      setFailed(true);
    } finally {
      setTyping(false);
    }
  }

  function send(value: string) {
    const v = value.trim();
    if (!v || typing || allAnswered) return;
    setText('');
    if (complaint === null) {
      setComplaint(v);
    } else {
      const next = [...answers, v];
      setAnswers(next);
      if (next.length === QUESTIONS.length) return void plan(next);
    }
    setTyping(true);
    setTimeout(() => setTyping(false), 900);
  }

  const messages: Message[] = [{ from: 'ai', text: `Hi${name ? ` ${name}` : ''}. What's bothering your eyes today?` }];
  if (complaint !== null) {
    messages.push({ from: 'me', text: complaint });
    for (let k = 0; k < QUESTIONS.length; k++) {
      const [question, , chips] = QUESTIONS[k];
      if (k < answers.length) {
        messages.push({ from: 'ai', text: question }, { from: 'me', text: answers[k] });
        continue;
      }
      if (!typing) messages.push({ from: 'ai', text: question, chips });
      break;
    }
  }
  if (done && session) {
    messages.push({
      from: 'ai',
      text: `Thanks, that helps. I've picked ${session.plan.length} tests for you, about ${minutes(session)} minutes.`,
      cta: true,
    });
  }
  if (done && failed) messages.push({ from: 'ai', text: "Sorry, I couldn't make your plan just now.", chips: ['Try again'] });

  const canSend = text.trim().length > 0 && !typing && !allAnswered;

  return (
    <KeyboardAvoidingView style={styles.root} behavior="padding">
      <View style={[styles.inner, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + 16 }]}>
        <ScreenHeader
          left="back"
          onLeft={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
          title="New check"
        />

        <ScrollView
          ref={scroll}
          style={styles.chat}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
          {messages.map((m, i) => (
            <View key={i} style={[styles.turn, m.from === 'me' && styles.turnMe]}>
              <View style={[styles.bubble, m.from === 'me' ? styles.me : styles.ai]}>
                <Text style={[styles.bubbleText, m.from === 'me' && styles.meText]}>{m.text}</Text>
              </View>
              {m.chips && (
                <View style={styles.chips}>
                  {m.chips.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => (c === 'Try again' ? plan(answers) : send(c))}
                      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
                      <Text style={styles.chipText}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
              {m.cta && (
                <Pressable
                  onPress={() => router.push('/check/plan')}
                  style={({ pressed }) => [styles.cta, pressed && styles.chipPressed]}>
                  <Text style={styles.ctaText}>See my test plan</Text>
                  <Icon name="arrowRight" size={18} color={Colors.white} strokeWidth={2.2} />
                </Pressable>
              )}
            </View>
          ))}
          {typing && (
            <View style={[styles.bubble, styles.ai, styles.typing]}>
              <View style={[styles.dot, { backgroundColor: '#BDBDB8' }]} />
              <View style={[styles.dot, { backgroundColor: '#A5A5A0' }]} />
              <View style={[styles.dot, { backgroundColor: '#8A8A85' }]} />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            value={text}
            onChangeText={setText}
            onSubmitEditing={() => send(text)}
            placeholder={done ? 'Add anything else…' : 'Type your answer…'}
            placeholderTextColor={Colors.faint}
            returnKeyType="send"
            style={styles.input}
          />
          <View accessibilityLabel="Voice input, coming soon" style={[styles.round, styles.mic]}>
            <Icon name="mic" size={20} strokeWidth={1.9} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send"
            disabled={!canSend}
            onPress={() => send(text)}
            style={[styles.round, { backgroundColor: canSend ? Colors.ink : '#D6D6D1' }]}>
            <Icon name="send" size={18} color={Colors.white} strokeWidth={2.2} />
          </Pressable>
        </View>
        <Text style={styles.disclaimer}>Visus isn&apos;t a diagnosis. Sudden vision loss? See a doctor now.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  inner: { flex: 1, paddingHorizontal: Spacing.xl },
  chat: { flex: 1 },
  chatContent: { flexGrow: 1, justifyContent: 'flex-end', gap: 12, paddingTop: 16, paddingBottom: 14 },
  turn: { alignItems: 'flex-start', gap: 8 },
  turnMe: { alignItems: 'flex-end' },
  bubble: { maxWidth: '82%', paddingVertical: 11, paddingHorizontal: 15, borderWidth: 1, borderRadius: 18 },
  ai: { backgroundColor: Colors.card, borderColor: Colors.border, borderBottomLeftRadius: 6 },
  me: { backgroundColor: Colors.ink, borderColor: Colors.ink, borderBottomRightRadius: 6 },
  bubbleText: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 22, color: Colors.ink },
  meText: { color: Colors.white },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.card,
    justifyContent: 'center',
  },
  chipPressed: { transform: [{ scale: 0.97 }] },
  chipText: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.ink },
  cta: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaText: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.white },
  typing: { height: 42, paddingVertical: 0, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  inputBar: {
    height: 56,
    paddingLeft: 18,
    paddingRight: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  input: { flex: 1, minWidth: 0, fontFamily: Fonts.regular, fontSize: 16, color: Colors.ink },
  round: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  mic: { opacity: 0.3 },
  disclaimer: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 17, color: '#8A8A85', textAlign: 'center', marginTop: 10 },
});
