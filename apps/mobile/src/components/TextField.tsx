import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Icon } from '@/components/Icon';
import { Colors, Fonts, Radius, Type } from '@/constants/theme';

type Props = Omit<TextInputProps, 'style' | 'secureTextEntry'> & {
  label: string;
  /** Adds the show / hide password button. */
  password?: boolean;
  /** Line under the input, e.g. a password hint. */
  hint?: ReactNode;
};

/** Labelled 52px input from Sign up / Log in. */
export function TextField({ label, password, hint, onFocus, onBlur, ...input }: Props) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          {...input}
          secureTextEntry={password && !visible}
          placeholderTextColor={Colors.faint}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, password && styles.inputWithButton, focused && styles.focused]}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            onPress={() => setVisible((v) => !v)}
            style={styles.eye}>
            <Icon name={visible ? 'eyeOff' : 'eye'} size={20} color={Colors.muted} strokeWidth={1.9} />
          </Pressable>
        )}
      </View>
      {hint}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { ...Type.label, color: Colors.inkSoft },
  input: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.card,
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.ink,
  },
  inputWithButton: { paddingRight: 52 },
  focused: { borderColor: Colors.ink, boxShadow: '0 0 0 4px rgba(17,17,17,0.06)' },
  eye: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
