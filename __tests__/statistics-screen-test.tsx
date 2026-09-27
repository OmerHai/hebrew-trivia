import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import * as ReactNative from 'react-native';

import CategoriesScreen from '@/app/categories';
import DifficultyScreen from '@/app/difficulty/[categoryId]';
import HomeScreen from '@/app/index';
import StatisticsScreen from '@/app/statistics';
import RootLayout from '@/app/_layout';
import { type CompletedGame, recordCompletedGame } from '@/storage/game-results';
import { categoryTints, palette } from '@/theme';

let nextId = 0;

function game(categoryId: string, difficulty: string, score: number): CompletedGame {
  nextId += 1;
  return { id: `game-${nextId}`, categoryId, difficulty, score, total: 10, completedAt: '2026-09-27T10:00:00.000Z' };
}

async function seed(...games: CompletedGame[]) {
  for (const completed of games) await recordCompletedGame(completed);
}

function renderStatistics(initialUrl = '/statistics') {
  return renderRouter(
    {
      _layout: RootLayout,
      index: HomeScreen,
      categories: CategoriesScreen,
      'difficulty/[categoryId]': DifficultyScreen,
      statistics: StatisticsScreen,
    },
    { initialUrl },
  );
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('<StatisticsScreen />', () => {
  test('the home screen opens the statistics', async () => {
    const router = renderStatistics('/');
    await router;

    await fireEvent.press(screen.getByRole('button', { name: 'סטטיסטיקות' }));

    expect(router.getPathname()).toBe('/statistics');
  });

  test('before any completed game it shows a friendly empty state that leads to the categories', async () => {
    const router = renderStatistics();
    await router;

    expect(await screen.findByRole('header', { name: 'עוד אין כאן נתונים' })).toBeOnTheScreen();
    expect(screen.getByText('שחקו משחק ראשון והסטטיסטיקות יתחילו להצטבר.')).toBeOnTheScreen();
    expect(screen.queryByLabelText(/^משחקים:/)).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'לבחירת נושא' }));

    expect(router.getPathname()).toBe('/categories');
  });

  test('shows the overall totals, average and best score', async () => {
    await seed(game('geography', 'easy', 6), game('geography', 'medium', 9), game('history', 'easy', 7), game('music', 'easy', 5));
    await renderStatistics();

    expect(await screen.findByLabelText('משחקים: 4')).toHaveTextContent('משחקים4');
    // "6.8/10" as one text run, so it stays in order inside right-to-left text.
    expect(screen.getByLabelText('ממוצע: 6.8 מתוך 10')).toHaveTextContent('ממוצע6.8/10');
    expect(screen.getByLabelText('שיא: 9 מתוך 10')).toHaveTextContent('שיא9/10');
    expect(screen.getByText('27 תשובות נכונות בסך הכול')).toBeOnTheScreen();
  });

  test('shows each level played, and only those', async () => {
    await seed(game('geography', 'easy', 10), game('history', 'easy', 7));
    await renderStatistics();

    expect(await screen.findByLabelText('קל: 2 משחקים, ממוצע 8.5 מתוך 10')).toBeOnTheScreen();
    expect(screen.queryByLabelText(/^בינוני:/)).not.toBeOnTheScreen();
  });

  test('easy and medium are shown separately', async () => {
    await seed(game('geography', 'easy', 10), game('geography', 'medium', 4));
    await renderStatistics();

    expect(await screen.findByLabelText('קל: משחק אחד, ממוצע 10 מתוך 10')).toBeOnTheScreen();
    expect(screen.getByLabelText('בינוני: משחק אחד, ממוצע 4 מתוך 10')).toBeOnTheScreen();
  });

  test('lists only the played categories, most played first, with games, average and best', async () => {
    await seed(game('history', 'easy', 9), game('geography', 'easy', 6), game('geography', 'medium', 8));
    await renderStatistics();

    const rows = await screen.findAllByLabelText(/^(גאוגרפיה|היסטוריה|מוזיקה|ספורט):/);
    expect(rows.map((row) => row.props.accessibilityLabel)).toEqual([
      'גאוגרפיה: 2 משחקים, ממוצע 7 מתוך 10, שיא 8 מתוך 10',
      'היסטוריה: משחק אחד, ממוצע 9 מתוך 10, שיא 9 מתוך 10',
    ]);
    expect(screen.queryByText('מוזיקה')).not.toBeOnTheScreen();
  });

  test('the strongest category needs at least 2 games there', async () => {
    await seed(game('history', 'easy', 10), game('geography', 'easy', 6));
    await renderStatistics();

    await screen.findByLabelText(/^משחקים:/);
    expect(screen.queryByText('הנושא החזק שלכם')).not.toBeOnTheScreen();
  });

  test('shows the strongest category once one qualifies, in its own color', async () => {
    await seed(
      game('music', 'easy', 10),
      game('geography', 'easy', 6),
      game('geography', 'medium', 7),
      game('history', 'easy', 8),
      game('history', 'medium', 9),
    );
    await renderStatistics();

    expect(
      await screen.findByLabelText('הנושא החזק שלכם: היסטוריה, ממוצע 8.5 מתוך 10, 2 משחקים'),
    ).toHaveStyle({ backgroundColor: categoryTints.light.olive.background });
  });

  test('corrupt stored statistics show the empty state instead of crashing', async () => {
    await AsyncStorage.setItem('game-results/v1', '{not json');
    await renderStatistics();

    expect(await screen.findByRole('header', { name: 'עוד אין כאן נתונים' })).toBeOnTheScreen();
  });

  test('partially corrupt statistics still show the valid games', async () => {
    await AsyncStorage.setItem(
      'game-results/v1',
      JSON.stringify({ version: 1, games: [game('geography', 'easy', 7), { score: 'lots' }, null] }),
    );
    await renderStatistics();

    expect(await screen.findByLabelText('משחקים: 1')).toBeOnTheScreen();
  });

  test('uses the dark palette in dark mode', async () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');
    await seed(game('geography', 'easy', 7));
    await renderStatistics();

    expect(await screen.findByText('7 תשובות נכונות בסך הכול')).toHaveStyle({ color: palette.dark.text });
  });
});
