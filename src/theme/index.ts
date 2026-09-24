import { useColorScheme } from '@/hooks/use-color-scheme';

import { categoryTints, palette } from './colors';

export * from './colors';
export * from './tokens';
export * from './typography';

const shadows = {
  light: { raised: '0 1px 2px rgba(26, 25, 21, 0.06), 0 4px 12px rgba(26, 25, 21, 0.05)' },
  // Dark surfaces are told apart by their fill, not by shadows.
  dark: { raised: 'none' },
} as const;

/** The color scheme's palette, category tints and shadows. */
export function useTheme() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return {
    scheme,
    colors: palette[scheme],
    tints: categoryTints[scheme],
    shadows: shadows[scheme],
  } as const;
}
