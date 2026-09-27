import { router as appRouter } from 'expo-router';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import CategoriesScreen from '@/app/categories';
import DifficultyScreen from '@/app/difficulty/[categoryId]';
import HomeScreen from '@/app/index';
import QuizScreen from '@/app/quiz/[categoryId]';
import RootLayout from '@/app/_layout';
import { categories } from '@/data/categories';
import { difficulties } from '@/data/difficulties';
import type { Question } from '@/types/question';

const questions: Question[] = Array.from({ length: 10 }, (_, index) => ({
  id: `q${index + 1}`,
  question: `שאלה מספר ${index + 1}?`,
  answers: ['א', 'ב', 'ג', 'ד'],
  correctAnswerIndex: 0,
  explanation: 'הסבר קצר.',
}));

const originalFetch = global.fetch;
const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
    // Like the API route: the first batch has 3 questions, the second the remaining 7.
    const batch = JSON.parse(init.body as string).count === 3 ? questions.slice(0, 3) : questions.slice(3);
    return { ok: true, status: 200, json: async () => ({ questions: batch }) };
  });
  global.fetch = fetchMock;
});

afterAll(() => {
  global.fetch = originalFetch;
});

function renderApp(initialUrl = '/categories') {
  return renderRouter(
    {
      _layout: RootLayout,
      index: HomeScreen,
      categories: CategoriesScreen,
      'difficulty/[categoryId]': DifficultyScreen,
      'quiz/[categoryId]': QuizScreen,
    },
    { initialUrl },
  );
}

function requestBody(call = 0) {
  return JSON.parse(fetchMock.mock.calls[call][1].body);
}

describe('navigation', () => {
  test('start game opens the category selection screen', async () => {
    // renderRouter attaches its route helpers to the returned promise, so keep
    // a reference to it instead of the awaited value.
    const router = renderApp('/');
    await router;

    await fireEvent.press(screen.getByRole('button', { name: 'בואו נשחק' }));

    expect(router.getPathname()).toBe('/categories');
    expect(await screen.findAllByRole('button')).toHaveLength(16);
  });

  test.each(categories)('selecting $name opens the difficulty selection for $id', async (category) => {
    const router = renderApp();
    await router;

    await fireEvent.press(screen.getByRole('button', { name: category.name }));

    expect(router.getPathname()).toBe(`/difficulty/${category.id}`);
    expect(await screen.findByText(category.name)).toBeOnTheScreen();
    expect(screen.getAllByRole('button').map((button) => button.props.accessibilityLabel)).toEqual([
      'קל',
      'בינוני',
    ]);
    // Nothing is generated until a level is chosen.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test.each(difficulties)(
    'choosing $name starts a freshly generated quiz for the chosen category on $id',
    async (difficulty) => {
      const router = renderApp();
      await router;

      await fireEvent.press(screen.getByRole('button', { name: 'היסטוריה' }));
      await fireEvent.press(await screen.findByRole('button', { name: difficulty.name }));

      expect(router.getPathname()).toBe('/quiz/history');
      expect(router.getSearchParams()).toEqual({ categoryId: 'history', difficulty: difficulty.id });
      expect(await screen.findByRole('progressbar', { name: 'שאלה 1 מתוך 10, 0 תשובות נכונות' })).toBeOnTheScreen();
      expect(fetchMock.mock.calls[0][0]).toBe('/api/quiz');
      // Only stable ids are sent; the server looks up the generation guidance.
      expect(requestBody()).toEqual({ categoryId: 'history', difficulty: difficulty.id, count: 3, exclude: [] });
    },
  );

  test('going back from the difficulty selection returns to the categories', async () => {
    const router = renderApp();
    await router;
    await fireEvent.press(screen.getByRole('button', { name: 'מדע' }));
    expect(router.getPathname()).toBe('/difficulty/science');

    await act(async () => appRouter.back());

    expect(router.getPathname()).toBe('/categories');
    expect(await screen.findAllByRole('button')).toHaveLength(16);
  });

  test('a quiz link without a difficulty asks for one instead of starting a game', async () => {
    const router = renderApp('/quiz/geography');
    await router;

    await waitFor(() => expect(router.getPathname()).toBe('/difficulty/geography'));
    expect(await screen.findByRole('button', { name: 'בינוני' })).toBeOnTheScreen();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('a quiz link with an unknown difficulty asks for one instead of starting a game', async () => {
    const router = renderApp('/quiz/geography?difficulty=expert');
    await router;

    await waitFor(() => expect(router.getPathname()).toBe('/difficulty/geography'));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('the difficulty screen for an unknown category offers to pick a topic', async () => {
    const router = renderApp('/difficulty/unknown');
    await router;

    expect(screen.getByRole('header', { name: 'לא מצאנו את הנושא הזה' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'קל' })).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'לבחירת נושא' }));
    expect(router.getPathname()).toBe('/categories');
  });

  test('the old custom topic route no longer starts a quiz', async () => {
    await renderApp();

    await act(async () => appRouter.push('/quiz/custom?topic=חלל&difficulty=easy'));

    expect(await screen.findByRole('header', { name: 'לא מצאנו את הנושא הזה' })).toBeOnTheScreen();
    expect(screen.queryByText(/חלל/)).not.toBeOnTheScreen();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
