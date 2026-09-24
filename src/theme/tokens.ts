import { StyleSheet } from 'react-native';

/** One spacing scale on a 4-point grid. Rows < groups < sections. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const layout = {
  /** Horizontal screen padding, the same on every screen. */
  gutter: spacing.xl,
  /** Comfortable minimum for anything tappable. */
  minTouchTarget: 48,
  /** Main buttons and answers. */
  controlHeight: 56,
} as const;

/** Pair every non-capsule radius with `borderCurve: 'continuous'`. */
export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 999,
} as const;

export const borders = {
  hairline: StyleSheet.hairlineWidth,
  thin: 1.5,
  thick: 2,
} as const;

/** The "physical" bottom edge of pressable surfaces, at rest and pressed. */
export const edge = {
  rest: 3,
  pressed: 1,
  /** Answers: quieter than buttons. */
  subtle: 2,
} as const;

export const motion = {
  /** State feedback: press, reveal. */
  fast: 150,
  /** Element transitions: feedback panel, action bar. */
  base: 220,
  /** Skeleton pulse half-cycle. */
  slow: 900,
} as const;

/** Upper bound on text scaling for fixed-height chrome (buttons, badges). Body text is unbounded. */
export const maxChromeFontScale = 1.4;
