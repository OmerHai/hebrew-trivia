import { renderHook } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme.web';

describe('useColorScheme (web)', () => {
  test('switches to the device scheme after hydration', async () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');

    const { result } = await renderHook(() => useColorScheme());

    expect(result.current).toBe('dark');
  });
});
