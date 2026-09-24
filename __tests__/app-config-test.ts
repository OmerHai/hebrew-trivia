import { palette } from '@/theme';

import appJson from '../app.json';

describe('app config', () => {
  test('forces RTL layout for the Hebrew-only app via expo-localization', () => {
    const localization = appJson.expo.plugins.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-localization',
    );

    expect(localization).toEqual([
      'expo-localization',
      { supportsRTL: true, forcesRTL: true, supportedLocales: ['he'] },
    ]);
  });

  test('shows the Hebrew app name on the home screen', () => {
    expect(appJson.expo.name).toBe('טריוויה');
  });

  test('no Expo template branding remains', () => {
    const config = JSON.stringify(appJson);

    expect(config).not.toMatch(/expo\.icon/);
    // The template's blue splash and light-blue Android icon background.
    expect(config).not.toMatch(/#208AEF|#E6F4FE/i);
  });

  test('the splash screen follows the app background in light and dark mode', () => {
    const splash = appJson.expo.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen');

    expect(splash).toEqual([
      'expo-splash-screen',
      expect.objectContaining({
        backgroundColor: palette.light.background,
        dark: expect.objectContaining({ backgroundColor: palette.dark.background }),
      }),
    ]);
  });
});
