import { render, screen } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import HomeScreen from '@/app/index';

describe('<HomeScreen />', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the Hebrew title and subtitle', async () => {
    await render(<HomeScreen />);

    expect(screen.getByRole('header', { name: 'טריוויה' })).toBeOnTheScreen();
    expect(screen.getByText('בוא נראה כמה אתה באמת יודע')).toBeOnTheScreen();
  });

  test('renders the start game button', async () => {
    await render(<HomeScreen />);

    expect(screen.getByRole('button', { name: 'התחל משחק' })).toBeOnTheScreen();
  });

  test('uses light text on the dark color scheme', async () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');

    await render(<HomeScreen />);

    expect(screen.getByRole('header', { name: 'טריוויה' })).toHaveStyle({ color: '#F2F5FA' });
  });
});
