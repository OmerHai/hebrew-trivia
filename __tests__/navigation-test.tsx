import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import CategoriesScreen from '@/app/categories';
import HomeScreen from '@/app/index';
import RootLayout from '@/app/_layout';

describe('navigation', () => {
  test('start game opens the category selection screen', async () => {
    // renderRouter attaches its route helpers to the returned promise, so keep
    // a reference to it instead of the awaited value.
    const router = renderRouter({ _layout: RootLayout, index: HomeScreen, categories: CategoriesScreen });
    await router;

    await fireEvent.press(screen.getByRole('button', { name: 'התחל משחק' }));

    expect(router.getPathname()).toBe('/categories');
    expect(await screen.findByRole('header', { name: 'בחר נושא' })).toBeOnTheScreen();
  });
});
