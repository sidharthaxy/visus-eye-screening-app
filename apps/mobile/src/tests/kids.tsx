// Pieces shared by the kids tests (34, 35): the smiling helper with a speech
// bubble, and the "Parent, help your child answer." line.
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Icon } from '@/components/Icon';
import { Colors, Fonts } from '@/constants/theme';

export const STAR = '#F2B233';

/** `pop` tilts the face for a moment after an answer. */
export function Mascot({ text, pop }: { text: string; pop?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={[styles.face, pop && styles.pop]}>
        <Svg width={34} height={34} viewBox="0 0 34 34" fill="none">
          <Circle cx={11.5} cy={14} r={3} fill={Colors.ink} />
          <Circle cx={22.5} cy={14} r={3} fill={Colors.ink} />
          <Path d="M11 21.5c1.6 2 3.6 3 6 3s4.4-1 6-3" stroke={Colors.ink} strokeWidth={2.4} strokeLinecap="round" />
        </Svg>
      </View>
      <View style={styles.bubble}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

export function ParentNote() {
  return (
    <View style={styles.note}>
      <Icon name="parent" size={18} color={Colors.inkSoft} />
      <Text style={styles.noteText}>Parent, help your child answer.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  face: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pop: { transform: [{ translateY: -6 }, { rotate: '-8deg' }] },
  bubble: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  text: { fontFamily: Fonts.semibold, fontSize: 16, lineHeight: 22, color: Colors.ink },
  note: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  noteText: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.inkSoft },
});
