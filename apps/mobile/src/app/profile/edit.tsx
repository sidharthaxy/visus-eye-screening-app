import type { Profile } from '@visus/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { AgeStepper, FieldLabel } from '@/components/Form';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { CONDITIONS, EYEWEAR, GENDERS, initials, NONE, PAST, SCREEN_TIME, screenLabel, toggleCondition } from '@/constants/profile';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { listProfiles, updateProfile } from '@/services/profiles';

type Form = Pick<Profile, 'name' | 'age' | 'gender' | 'eyewear' | 'pastEyeTest' | 'healthConditions' | 'screenHoursPerDay'>;

/** Chips for one answer; tapping the selected one clears it, as in onboarding. */
function Choice<T extends string>({ list, value, onPick }: { list: [T, string][]; value?: T; onPick: (v?: T) => void }) {
  return (
    <View style={styles.chips}>
      {list.map(([id, label]) => (
        <Chip key={id} compact label={label} selected={value === id} onPress={() => onPick(value === id ? undefined : id)} />
      ))}
    </View>
  );
}

/** Screen 50: Edit profile. */
export default function EditProfile() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    listProfiles().then((all) => {
      const p = all.find((x) => x.id === id) ?? all[0];
      if (!live) return;
      setProfile(p);
      setForm({
        name: p.name,
        age: p.age,
        gender: p.gender,
        eyewear: p.eyewear,
        pastEyeTest: p.pastEyeTest,
        healthConditions: p.healthConditions,
        screenHoursPerDay: p.screenHoursPerDay,
      });
    });
    return () => {
      live = false;
    };
  }, [id]);

  const set = (patch: Partial<Form>) => {
    setForm((f) => (f ? { ...f, ...patch } : f));
    setSaved(false);
  };

  async function save() {
    if (!profile || !form || !form.name.trim()) return;
    setSaving(true);
    setFailed(false);
    try {
      await updateProfile(profile.id, {
        ...form,
        name: form.name.trim(),
        wearsGlasses: form.eyewear ? form.eyewear !== 'none' : profile.wearsGlasses,
        healthConditions: form.healthConditions.filter((c) => c !== NONE),
        isChild: profile.relation === 'self' ? false : form.age < 13,
      });
      setSaved(true);
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior="padding">
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <ScreenHeader left="back" onLeft={() => router.back()} title="Edit profile" />
      </View>
      {!form ? (
        <ActivityIndicator color={Colors.ink} style={styles.loading} />
      ) : (
        <>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            <View style={styles.nameRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(form.name) || 'A'}</Text>
              </View>
              <View style={styles.nameField}>
                <TextField label="Name" value={form.name} onChangeText={(name) => set({ name })} placeholder="Your name" />
              </View>
            </View>

            <FieldLabel label="Gender">
              <Choice list={GENDERS.map((g) => [g, g])} value={form.gender} onPick={(gender) => set({ gender })} />
            </FieldLabel>
            <FieldLabel label="Age">
              <AgeStepper age={form.age} min={profile?.relation === 'self' ? 5 : 1} onChange={(age) => set({ age })} />
            </FieldLabel>
            <FieldLabel label="Glasses or lenses">
              <Choice list={EYEWEAR} value={form.eyewear} onPick={(eyewear) => set({ eyewear })} />
            </FieldLabel>
            <FieldLabel label="Past eye test or diagnosis">
              <Choice list={PAST} value={form.pastEyeTest} onPick={(pastEyeTest) => set({ pastEyeTest })} />
            </FieldLabel>
            <FieldLabel label="Health conditions">
              <View style={styles.chips}>
                {CONDITIONS.map((c) => (
                  <Chip
                    key={c}
                    compact
                    label={c}
                    selected={form.healthConditions.includes(c)}
                    onPress={() => set({ healthConditions: toggleCondition(form.healthConditions, c) })}
                  />
                ))}
              </View>
            </FieldLabel>
            <FieldLabel label="Daily screen time">
              <Choice
                list={SCREEN_TIME.map(([label]) => [label, label])}
                value={screenLabel(form.screenHoursPerDay)}
                onPick={(label) => set({ screenHoursPerDay: SCREEN_TIME.find(([l]) => l === label)?.[1] ?? 0 })}
              />
            </FieldLabel>
            {failed && <Text style={styles.error}>Couldn&apos;t save. Check your internet connection and try again.</Text>}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 30 }]}>
            <Button
              title={saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save changes'}
              disabled={saving || !form.name.trim()}
              onPress={() => void save()}
            />
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.xl },
  loading: { marginTop: 40 },
  content: { paddingTop: 18, paddingHorizontal: Spacing.xl, paddingBottom: 24, gap: 22 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.bold, fontSize: 21, color: Colors.accInk },
  nameField: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  error: { fontFamily: Fonts.regular, fontSize: 14, color: '#A3342A' },
  footer: { paddingTop: 12, paddingHorizontal: Spacing.xl, backgroundColor: Colors.bg },
});
