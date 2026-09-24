import type { TextStyle } from 'react-native';

/**
 * Rubik faces, loaded in the root layout. Each weight is its own family, so
 * styles set `fontFamily` and never `fontWeight` (which would make Android fall
 * back to the system font).
 */
export const fonts = {
  regular: 'Rubik_400Regular',
  medium: 'Rubik_500Medium',
  semibold: 'Rubik_600SemiBold',
  bold: 'Rubik_700Bold',
} as const;

/** The type ramp. Screens pick a variant through `ThemedText`, never a raw font size. */
export const type = {
  /** Home wordmark and the results score. */
  display: { fontFamily: fonts.bold, fontSize: 52, lineHeight: 60 },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 36 },
  /** The quiz question: the loudest thing on the quiz screen. */
  question: { fontFamily: fonts.semibold, fontSize: 24, lineHeight: 34 },
  /** Buttons, category names, feedback. */
  headline: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 26 },
  answer: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;
