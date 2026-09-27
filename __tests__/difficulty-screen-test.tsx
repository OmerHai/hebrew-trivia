import { renderRouter, screen, within } from 'expo-router/testing-library';
import * as ReactNative from 'react-native';

import CategoriesScreen from '@/app/categories';
import DifficultyScreen from '@/app/difficulty/[categoryId]';
import HomeScreen from '@/app/index';
import RootLayout from '@/app/_layout';
import { difficulties } from '@/data/difficulties';
import { categoryTints, palette } from '@/theme';

function renderDifficulty(categoryId = 'geography') {
  return renderRouter(
    { _layout: RootLayout, index: HomeScreen, categories: CategoriesScreen, 'difficulty/[categoryId]': DifficultyScreen },
    { initialUrl: `/difficulty/${categoryId}` },
  );
}

describe('<DifficultyScreen />', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('shows the chosen category on its own soft color', async () => {
    await renderDifficulty('football');

    expect(screen.getByText('כדורגל')).toBeOnTheScreen();
    expect(screen.queryByText('גאוגרפיה')).not.toBeOnTheScreen();
  });

  test('offers exactly two levels, easy first, each with a Hebrew description', async () => {
    await renderDifficulty();

    const options = screen.getAllByRole('button');
    expect(options.map((option) => option.props.accessibilityLabel)).toEqual(['קל', 'בינוני']);
    for (const [index, difficulty] of difficulties.entries()) {
      expect(options[index]).toHaveTextContent(difficulty.name, { exact: false });
      expect(options[index]).toHaveTextContent(difficulty.description, { exact: false });
      expect(options[index].props.accessibilityHint).toBe(difficulty.description);
    }
  });

  test('each level fills more of its meter, in the category color', async () => {
    await renderDifficulty('geography');
    const accent = categoryTints.light.teal.foreground;

    for (const difficulty of difficulties) {
      const option = screen.getByRole('button', { name: difficulty.name });
      // Decorative: hidden from screen readers, which get the name and description.
      const bars = within(option).getAllByTestId('difficulty-meter-bar', { includeHiddenElements: true });
      expect(bars).toHaveLength(2);
      expect(bars.filter((bar) => bar.props.style.backgroundColor === accent)).toHaveLength(difficulty.level);
    }
  });

  test('uses the dark palette in dark mode', async () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');

    await renderDifficulty();

    expect(screen.getByRole('button', { name: 'קל' })).toHaveStyle({ backgroundColor: palette.dark.surface });
    expect(screen.getByText('קל')).toHaveStyle({ color: palette.dark.text });
  });
});

