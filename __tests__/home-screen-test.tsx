import { render, screen } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import HomeScreen from '@/app/index';
import { palette } from '@/theme';

describe('<HomeScreen />', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('shows the Hebrew brand and tagline, addressing players in the plural', async () => {
    await render(<HomeScreen />);

    expect(screen.getByRole('header', { name: 'טריוויה' })).toBeOnTheScreen();
    expect(screen.getByText('עשר שאלות. נושא אחד. כמה תדעו?')).toBeOnTheScreen();
    expect(screen.getByText('16 נושאים · שאלות חדשות בכל סיבוב')).toBeOnTheScreen();
  });

  test('renders the start game button', async () => {
    await render(<HomeScreen />);

    expect(screen.getByRole('button', { name: 'בואו נשחק' })).toBeOnTheScreen();
  });

  test('uses the light-on-dark palette in dark mode', async () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');

    await render(<HomeScreen />);

    expect(screen.getByRole('header', { name: 'טריוויה' })).toHaveStyle({ color: palette.dark.text });
  });
});
