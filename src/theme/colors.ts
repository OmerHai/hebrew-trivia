/**
 * Brand palette as explicit light/dark pairs. The game has its own look
 * ("TV quiz night": ink-and-paper neutrals with one sunflower accent), so it
 * doesn't use platform semantic colors. Read it through `useTheme()`.
 */
const light = {
  background: '#F7F6F3',
  surface: '#FFFFFF',
  surfaceMuted: '#EFEDE8',
  border: '#E4E1DA',
  /** Upcoming dots in the progress track and skeleton blocks. */
  track: '#D6D2C9',
  text: '#1A1915',
  textSecondary: '#5E5A52',
  /** Fill only: never use the accent as a text color. */
  accent: '#FFC43D',
  accentEdge: '#D9A11F',
  onAccent: '#1A1915',
  /** Fills that carry meaning (dots, badges): at least 3:1 against the background. */
  success: '#079455',
  successText: '#067647',
  successSurface: '#E3F6EC',
  danger: '#D92D20',
  dangerText: '#B42318',
  dangerSurface: '#FDE8E6',
  /** Icons drawn on a success/danger fill. */
  onStatus: '#FFFFFF',
};

type Palette = typeof light;

const dark: Palette = {
  background: '#141311',
  surface: '#1E1D1A',
  surfaceMuted: '#292724',
  border: '#34322E',
  track: '#46433D',
  text: '#F5F3EE',
  textSecondary: '#ADA89E',
  accent: '#FFC43D',
  accentEdge: '#C28E14',
  onAccent: '#1A1915',
  success: '#32D583',
  successText: '#6CE9A6',
  successSurface: '#15301F',
  danger: '#F97066',
  dangerText: '#FDA29B',
  dangerSurface: '#3A1D1B',
  onStatus: '#141311',
};

export const palette = { light, dark };
export type ThemeColors = Palette;

/** Soft per-category colors, used only on category tiles and category marks. */
const categoryTints = {
  light: {
    coral: { background: '#FDE8E3', foreground: '#B93A0B' },
    teal: { background: '#DDF3EF', foreground: '#0F6E66' },
    olive: { background: '#F0EDD8', foreground: '#6E5B0F' },
    violet: { background: '#EEE8FB', foreground: '#6D3FC0' },
    green: { background: '#E2F3E4', foreground: '#1E7B34' },
    sky: { background: '#E0EFFA', foreground: '#0B659F' },
    pink: { background: '#FBE6EF', foreground: '#AD2165' },
    blue: { background: '#E6E9FA', foreground: '#3848B8' },
  },
  dark: {
    coral: { background: '#3A2420', foreground: '#FF9E80' },
    teal: { background: '#1B3330', foreground: '#5EE0CC' },
    olive: { background: '#33301C', foreground: '#E0CB6E' },
    violet: { background: '#2C2540', foreground: '#B9A0F5' },
    green: { background: '#1E3322', foreground: '#7BD88F' },
    sky: { background: '#1A2D3B', foreground: '#7CC4F5' },
    pink: { background: '#3A2030', foreground: '#F59BC4' },
    blue: { background: '#22263F', foreground: '#9BA8F5' },
  },
} as const;

export { categoryTints };
export type CategoryTint = keyof (typeof categoryTints)['light'];
