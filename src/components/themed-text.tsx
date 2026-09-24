import { Text, type TextProps } from 'react-native';

import { type ThemeColors, type TypeVariant, type as typeRamp, useTheme } from '@/theme';

type Tone = 'primary' | 'secondary' | 'success' | 'danger' | 'onAccent';

const toneColor: Record<Tone, keyof ThemeColors> = {
  primary: 'text',
  secondary: 'textSecondary',
  success: 'successText',
  danger: 'dangerText',
  onAccent: 'onAccent',
};

type Props = TextProps & {
  variant?: TypeVariant;
  tone?: Tone;
};

/** All app text goes through here, so sizes and colors come from the theme. */
export function ThemedText({ variant = 'body', tone = 'primary', style, ...props }: Props) {
  const { colors } = useTheme();
  return (
    <Text
      style={[typeRamp[variant], { color: colors[toneColor[tone]], includeFontPadding: false }, style]}
      {...props}
    />
  );
}
