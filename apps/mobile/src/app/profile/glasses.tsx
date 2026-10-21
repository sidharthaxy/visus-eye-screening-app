import { PrescriptionEye, type Prescription, type Profile } from '@visus/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { SwitchRow } from '@/components/Form';
import { FormScreen } from '@/components/FormScreen';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text, TextInput } from '@/components/Text';
import { formatPower } from '@/constants/profile';
import { fullDate } from '@/constants/report';
import { Colors, Fonts } from '@/constants/theme';
import { listProfiles, updateProfile } from '@/services/profiles';

type Side = 'right' | 'left';
type Values = Record<Side, { sph: string; cyl: string; axis: string }>;

const EMPTY: Values = { right: { sph: '', cyl: '', axis: '' }, left: { sph: '', cyl: '', axis: '' } };

const toText = (rx: Prescription): Values => ({
  right: { sph: formatPower(rx.right.sph), cyl: formatPower(rx.right.cyl), axis: String(rx.right.axis) },
  left: { sph: formatPower(rx.left.sph), cyl: formatPower(rx.left.cyl), axis: String(rx.left.axis) },
});

/** "−1.25" or "-1,25" → -1.25; an empty CYL or AXIS counts as 0. */
const num = (text: string) => Number(text.replace('−', '-').replace(',', '.').trim() || '0');

function parse(values: Values) {
  const eye = (side: Side) =>
    PrescriptionEye.safeParse({ sph: num(values[side].sph), cyl: num(values[side].cyl), axis: num(values[side].axis) });
  const right = eye('right');
  const left = eye('left');
  const filled = values.right.sph.trim() && values.left.sph.trim();
  return filled && right.success && left.success ? { right: right.data, left: left.data } : null;
}

const ROWS: [Side, string, string][] = [
  ['right', 'Right', 'OD'],
  ['left', 'Left', 'OS'],
];
const COLUMNS = [
  ['sph', 'sphere', 'numeric'],
  ['cyl', 'cylinder', 'numeric'],
  ['axis', 'axis', 'number-pad'],
] as const;

/** Screen 51: My glasses. The last prescription, or "I don't know". */
export default function MyGlasses() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [unknown, setUnknown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    listProfiles().then((all) => {
      const p = all.find((x) => x.id === id) ?? all[0];
      if (!live) return;
      setProfile(p);
      if (p.prescription) setValues(toText(p.prescription));
      setUnknown(p.prescription === null);
    });
    return () => {
      live = false;
    };
  }, [id]);

  const edit = (side: Side, key: keyof Values[Side], text: string) => {
    setValues((v) => ({ ...v, [side]: { ...v[side], [key]: text } }));
    setSaved(false);
    setError(null);
  };

  async function save() {
    if (!profile) return;
    const rx = parse(values);
    if (!unknown && !rx) {
      setError('Check the numbers: SPH −30 to +30, CYL −15 to +15, AXIS 0–180. Fill in SPH for both eyes.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile(profile.id, {
        prescription: unknown ? null : { ...rx!, updatedAt: new Date().toISOString() },
      });
      setProfile(updated);
      setSaved(true);
    } catch {
      setError("Couldn't save. Check your internet connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const updated = profile?.prescription?.updatedAt;
  const dateLine = saved ? 'Updated today' : updated ? `Last updated ${fullDate(updated)}` : 'Not added yet';

  return (
    <FormScreen>
      <ScreenHeader left="back" onLeft={() => router.back()} title="My glasses" />
      {!profile ? (
        <ActivityIndicator color={Colors.ink} style={styles.loading} />
      ) : (
        <>
          <Text style={styles.title}>Your prescription</Text>
          <View style={styles.date}>
            <Icon name="calendar" size={16} color={Colors.muted} strokeWidth={1.9} />
            <Text style={styles.dateText}>{dateLine}</Text>
          </View>

          <View style={[styles.table, unknown && styles.off]} pointerEvents={unknown ? 'none' : 'auto'}>
            <View style={styles.row}>
              <View style={styles.eyeCell} />
              {COLUMNS.map(([key]) => (
                <Text key={key} style={styles.head}>
                  {key.toUpperCase()}
                </Text>
              ))}
            </View>
            {ROWS.map(([side, label, code]) => (
              <View key={side} style={styles.row}>
                <View style={styles.eyeCell}>
                  <Text style={styles.eye}>{label}</Text>
                  <Text style={styles.code}>{code}</Text>
                </View>
                {COLUMNS.map(([key, name, keyboard]) => (
                  <TextInput
                    key={key}
                    value={values[side][key]}
                    onChangeText={(t) => edit(side, key, t)}
                    accessibilityLabel={`${label} eye ${name}`}
                    keyboardType={keyboard}
                    maxLength={6}
                    selectTextOnFocus
                    style={styles.input}
                  />
                ))}
              </View>
            ))}
          </View>
          <Text style={styles.units}>SPH and CYL are in dioptres. AXIS is 0–180°.</Text>

          <View style={styles.switch}>
            <SwitchRow
              title="I don't know my prescription"
              sub="We'll go by your test results instead"
              value={unknown}
              onChange={(on) => {
                setUnknown(on);
                setSaved(false);
                setError(null);
              }}
            />
          </View>

          <View style={styles.tip}>
            <Icon name="bulb" size={22} color={Colors.accInk} />
            <Text style={styles.tipText}>These numbers are on the slip from your last eye test. Your optician can also share them.</Text>
          </View>
          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.spacer} />
          <Button title={saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save'} disabled={saving} onPress={() => void save()} />
          <Button
            title="Check if my glasses are still right"
            variant="ghost"
            onPress={() => router.push({ pathname: '/check/glasses', params: { id: profile.id } })}
            style={styles.check}
          />
        </>
      )}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 40 },
  title: { marginTop: 20, fontFamily: Fonts.bold, fontSize: 28, lineHeight: 32, letterSpacing: -0.7, color: Colors.ink },
  date: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.muted },
  table: {
    marginTop: 18,
    paddingTop: 12,
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  off: { opacity: 0.4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeCell: { width: 64, gap: 1 },
  head: { flex: 1, textAlign: 'center', fontFamily: Fonts.bold, fontSize: 12, letterSpacing: 0.5, color: '#8A8A85' },
  eye: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.ink },
  code: { fontFamily: Fonts.regular, fontSize: 12, color: '#8A8A85' },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.card,
    textAlign: 'center',
    fontFamily: Fonts.semibold,
    fontSize: 17,
    color: Colors.ink,
    fontVariant: ['tabular-nums'],
  },
  units: { marginTop: 8, marginHorizontal: 4, fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18, color: Colors.muted },
  switch: { marginTop: 14 },
  tip: { marginTop: 12, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', gap: 12, borderRadius: 20, backgroundColor: Colors.accSoft },
  tipText: { flex: 1, fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22, color: Colors.inkSoft },
  error: { marginTop: 12, fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, color: '#A3342A' },
  spacer: { flex: 1, minHeight: 16 },
  check: { marginTop: 4 },
});
