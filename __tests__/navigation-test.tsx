import { router as appRouter } from 'expo-router';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import CategoriesScreen from '@/app/categories';
import HomeScreen from '@/app/index';
import QuizScreen from '@/app/quiz/[categoryId]';
import RootLayout from '@/app/_layout';
import { categories } from '@/data/categories';
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

function renderFromCategories() {
  return renderRouter(
    {
      _layout: RootLayout,
      index: HomeScreen,
      categories: CategoriesScreen,
      'quiz/[categoryId]': QuizScreen,
    },
    { initialUrl: '/categories' },
  );
}

function requestBody(call = 0) {
  return JSON.parse(fetchMock.mock.calls[call][1].body);
}

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

  test.each(categories)('selecting $name starts a freshly generated quiz for $id', async (category) => {
    const router = renderFromCategories();
    await router;

    await fireEvent.press(screen.getByRole('button', { name: category.name }));

    expect(router.getPathname()).toBe(`/quiz/${category.id}`);
    expect(await screen.findByText(`${category.emoji} ${category.name}`)).toBeOnTheScreen();
    expect(screen.getByText('שאלה 1 מתוך 10')).toBeOnTheScreen();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/quiz');
    // Only the stable id is sent; the server looks up the generation context.
    expect(requestBody()).toEqual({ categoryId: category.id, count: 3, exclude: [] });
  });

  test('the old custom topic route no longer starts a quiz', async () => {
    await renderFromCategories();

    await act(async () => appRouter.push('/quiz/custom?topic=חלל'));

    expect(await screen.findByText('לא מצאנו שאלות בנושא הזה')).toBeOnTheScreen();
    expect(screen.queryByText(/חלל/)).not.toBeOnTheScreen();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
