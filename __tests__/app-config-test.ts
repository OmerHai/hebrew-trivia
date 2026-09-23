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
});
