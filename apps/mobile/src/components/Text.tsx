// Text that follows Settings → Text size. Every screen uses these instead of the
// React Native ones, so one setting scales the whole app.
import {
  Text as RNText,
  TextInput as RNTextInput,
  StyleSheet,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { useTextScale } from '@/store/settings';

/** Multiplies font size, line height and letter spacing. Text without a font size inherits its parent's (already scaled). */
function scaled(style: StyleProp<TextStyle>, scale: number): StyleProp<TextStyle> {
  if (scale === 1) return style;
  const flat = StyleSheet.flatten(style);
  if (!flat?.fontSize) return style;
  const extra: TextStyle = { fontSize: flat.fontSize * scale };
  if (typeof flat.lineHeight === 'number') extra.lineHeight = flat.lineHeight * scale;
  if (typeof flat.letterSpacing === 'number') extra.letterSpacing = flat.letterSpacing * scale;
  return [style, extra];
}

export function Text({ style, ...props }: TextProps) {
  const scale = useTextScale();
  return <RNText {...props} style={scaled(style, scale)} />;
}

export function TextInput({ style, ...props }: TextInputProps) {
  const scale = useTextScale();
  return <RNTextInput {...props} style={scaled(style, scale)} />;
}

/**
 * For test symbols sized in mm from calibration (letters, reading lines):
 * ignores both the app text size and the phone's own font size.
 */
export function FixedText(props: TextProps) {
  return <RNText {...props} allowFontScaling={false} />;
}
