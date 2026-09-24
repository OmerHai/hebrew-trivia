import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import CategoriesScreen from '@/app/categories';
import HomeScreen from '@/app/index';
import QuizScreen from '@/app/quiz/[categoryId]';
import ResultsScreen from '@/app/results';
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
    const batch = JSON.parse(init.body as string).count === 3 ? questions.slice(0, 3) : questions.slice(3);
    return { ok: true, status: 200, json: async () => ({ questions: batch }) };
  });
  global.fetch = fetchMock;
});

afterAll(() => {
  global.fetch = originalFetch;
});

function renderResults(initialUrl: string) {
  return renderRouter(
    {
      _layout: RootLayout,
      index: HomeScreen,
      categories: CategoriesScreen,
      'quiz/[categoryId]': QuizScreen,
      results: ResultsScreen,
    },
    { initialUrl },
  );
}

describe('<ResultsScreen />', () => {
  test('shows the category, the score as one "7/10" string, and the answer track', async () => {
    await renderResults('/results?categoryId=history&track=1101101011');

    expect(screen.getByText('היסטוריה')).toBeOnTheScreen();
    // A single text run keeps the number in order inside right-to-left text.
    expect(screen.getByLabelText('7 מתוך 10')).toHaveTextContent('7/10');
    expect(screen.getByRole('progressbar', { name: '7 תשובות נכונות מתוך 10' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'יפה מאוד' })).toBeOnTheScreen();
  });

  test.each([
    ['1111111111', 'ציון מושלם!'],
    ['1111111110', 'מצוין!'],
    ['1111100000', 'לא רע'],
    ['0000000000', 'נושא לא פשוט'],
  ])('a track of %s gets the message "%s"', async (track, title) => {
    await renderResults(`/results?categoryId=music&track=${track}`);

    expect(screen.getByRole('header', { name: title })).toBeOnTheScreen();
  });

  test('"עוד סיבוב" starts a freshly generated quiz in the same category', async () => {
    const router = renderResults('/results?categoryId=history&track=1101101011');
    await router;

    await fireEvent.press(screen.getByRole('button', { name: 'עוד סיבוב' }));

    expect(router.getPathname()).toBe('/quiz/history');
    // A new game: back to the first question, nothing answered.
    expect(await screen.findByRole('progressbar', { name: 'שאלה 1 מתוך 10, 0 תשובות נכונות' })).toBeOnTheScreen();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ categoryId: 'history', count: 3 });
  });

  test('"נושא אחר" goes to the category selection', async () => {
    const router = renderResults('/results?categoryId=history&track=1101101011');
    await router;

    await fireEvent.press(screen.getByRole('button', { name: 'נושא אחר' }));

    expect(router.getPathname()).toBe('/categories');
  });

  test.each([
    ['an unknown category', '/results?categoryId=nope&track=1101101011'],
    ['a malformed track', '/results?categoryId=history&track=12x'],
    ['no track', '/results?categoryId=history'],
  ])('with %s it offers to pick a topic instead of a score', async (_case, url) => {
    const router = renderResults(url);
    await router;

    expect(screen.getByRole('header', { name: 'אין תוצאות להציג' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'לבחירת נושא' }));
    expect(router.getPathname()).toBe('/categories');
  });
});
