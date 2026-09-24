import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import CategoriesScreen from '@/app/categories';
import HomeScreen from '@/app/index';
import QuizScreen from '@/app/quiz/[categoryId]';
import CustomTopicQuizScreen from '@/app/quiz/custom';
import RootLayout from '@/app/_layout';
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
      'quiz/custom': CustomTopicQuizScreen,
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

  test('selecting a category starts a freshly generated quiz for that category', async () => {
    const router = renderFromCategories();
    await router;

    await fireEvent.press(screen.getByRole('button', { name: 'טכנולוגיה' }));

    expect(router.getPathname()).toBe('/quiz/technology');
    expect(await screen.findByText('💻 טכנולוגיה')).toBeOnTheScreen();
    expect(screen.getByText('שאלה 1 מתוך 10')).toBeOnTheScreen();
    expect(requestBody()).toEqual({ categoryId: 'technology', count: 3, exclude: [] });
  });

  test('a custom topic starts a generated quiz on that topic', async () => {
    const router = renderFromCategories();
    await router;

    await fireEvent.press(screen.getByRole('button', { name: 'נושא משלי' }));
    await fireEvent.changeText(screen.getByLabelText('הנושא שלך'), '  מוזיקה ישראלית  ');
    await fireEvent.press(screen.getByRole('button', { name: 'צור משחק' }));

    expect(router.getPathname()).toBe('/quiz/custom');
    expect(await screen.findByText('✏️ מוזיקה ישראלית')).toBeOnTheScreen();
    expect(requestBody()).toEqual({ topic: 'מוזיקה ישראלית', count: 3, exclude: [] });
  });

  test.each([
    ['empty', ''],
    ['whitespace-only', '   '],
  ])('an %s custom topic is rejected with a Hebrew message', async (_case, topic) => {
    const router = renderFromCategories();
    await router;

    await fireEvent.press(screen.getByRole('button', { name: 'נושא משלי' }));
    await fireEvent.changeText(screen.getByLabelText('הנושא שלך'), topic);
    await fireEvent.press(screen.getByRole('button', { name: 'צור משחק' }));

    expect(screen.getByText('צריך לכתוב נושא כדי ליצור משחק')).toBeOnTheScreen();
    expect(router.getPathname()).toBe('/categories');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('typing after a validation error clears the message', async () => {
    await renderFromCategories();

    await fireEvent.press(screen.getByRole('button', { name: 'נושא משלי' }));
    await fireEvent.press(screen.getByRole('button', { name: 'צור משחק' }));
    expect(screen.getByText('צריך לכתוב נושא כדי ליצור משחק')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('הנושא שלך'), 'חלל');

    expect(screen.queryByText('צריך לכתוב נושא כדי ליצור משחק')).not.toBeOnTheScreen();
  });
});
