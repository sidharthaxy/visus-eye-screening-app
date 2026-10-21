import type { Relation } from '@visus/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { AgeStepper, FieldLabel, SwitchRow } from '@/components/Form';
import { FormScreen } from '@/components/FormScreen';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { initials, RELATIONS } from '@/constants/profile';
import { Colors, Fonts } from '@/constants/theme';
import { createProfile } from '@/services/profiles';

const KIDS_AGE = 13;

/** Screen 49: Add family member. */
export default function AddFamilyMember() {
  const [name, setName] = useState('');
  const [age, setAge] = useState(8);
  const [relation, setRelation] = useState<Exclude<Relation, 'self'>>('child');
  const [child, setChild] = useState(true);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const ini = initials(name);

  async function save() {
    if (!name.trim() || saving) return;
    setSaving(true);
    setFailed(false);
    try {
      await createProfile({
        name: name.trim(),
        age,
        isChild: child,
        relation,
        wearsGlasses: false,
        healthConditions: [],
        screenHoursPerDay: 0,
      });
      router.back();
    } catch {
      setFailed(true);
      setSaving(false);
    }
  }

  return (
    <FormScreen>
      <ScreenHeader left="back" onLeft={() => router.back()} title="Add someone" />

      <View style={styles.avatar}>
        {ini ? <Text style={styles.avatarText}>{ini}</Text> : <Icon name="profile" size={30} color="#8A8A85" strokeWidth={1.8} />}
      </View>

      <View style={styles.fields}>
        <TextField label="Name" value={name} onChangeText={setName} placeholder="Their name" autoCapitalize="words" />
        <FieldLabel label="Age">
          <AgeStepper
            age={age}
            onChange={(a) => {
              setAge(a);
              // Crossing 13 flips the kids switch; it can still be changed by hand.
              if ((a < KIDS_AGE) !== (age < KIDS_AGE)) setChild(a < KIDS_AGE);
            }}
          />
        </FieldLabel>
        <FieldLabel label="Relation">
          <View style={styles.chips}>
            {RELATIONS.map(([id, label]) => (
              <Chip key={id} compact label={label} selected={relation === id} onPress={() => setRelation(id)} />
            ))}
          </View>
        </FieldLabel>
        <SwitchRow title="This is a child" sub="Uses kids tests, done with a parent" value={child} onChange={setChild} />
        {failed && <Text style={styles.error}>Couldn&apos;t save. Check your internet connection and try again.</Text>}
      </View>

      <View style={styles.spacer} />
      <Button title={saving ? 'Saving…' : 'Save'} disabled={!name.trim() || saving} onPress={() => void save()} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    marginTop: 18,
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.ink },
  fields: { marginTop: 18, gap: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  error: { fontFamily: Fonts.regular, fontSize: 14, color: '#A3342A' },
  spacer: { flex: 1, minHeight: 16 },
});
