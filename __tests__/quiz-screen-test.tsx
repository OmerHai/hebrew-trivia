import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import HomeScreen from '@/app/index';
import QuizScreen from '@/app/quiz/[categoryId]';
import CustomTopicQuizScreen from '@/app/quiz/custom';
import ResultsScreen from '@/app/results';
import RootLayout from '@/app/_layout';
import type { Question } from '@/types/question';

// Keep the generated order so tests know which question is shown.
jest.mock('@/utils/shuffle', () => ({ shuffle: <T,>(items: readonly T[]) => [...items] }));

const geography: Question[] = [
  {
    id: 'q1',
    question: 'מהי בירת אוסטרליה?',
    answers: ['סידני', 'מלבורן', 'קנברה', 'פרת׳'],
    correctAnswerIndex: 2,
    explanation: 'קנברה נבחרה כבירה כפשרה בין סידני למלבורן.',
  },
  {
    id: 'q2',
    question: 'מהו הנהר הארוך ביותר באפריקה?',
    answers: ['הנילוס', 'הקונגו', 'הניגר', 'הזמבזי'],
    correctAnswerIndex: 0,
    explanation: 'הנילוס זורם לאורך כ־6,650 קילומטרים.',
  },
  {
    id: 'q3',
    question: 'באיזו יבשת נמצאת פרו?',
    answers: ['אפריקה', 'דרום אמריקה', 'אסיה', 'צפון אמריקה'],
    correctAnswerIndex: 1,
    explanation: 'פרו שוכנת בחוף המערבי של דרום אמריקה.',
  },
  {
    id: 'q4',
    question: 'מהו האוקיינוס הגדול בעולם?',
    answers: ['האטלנטי', 'ההודי', 'הארקטי', 'השקט'],
    correctAnswerIndex: 3,
    explanation: 'האוקיינוס השקט מכסה כשליש משטח כדור הארץ.',
  },
  {
    id: 'q5',
    question: 'מהי המדינה הגדולה בעולם בשטחה?',
    answers: ['רוסיה', 'קנדה', 'סין', 'ארצות הברית'],
    correctAnswerIndex: 0,
    explanation: 'שטחה של רוסיה עולה על 17 מיליון קמ״ר.',
  },
];

const originalFetch = global.fetch;
const fetchMock = jest.fn();

function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
}

function correctAnswer(index: number) {
  return geography[index].answers[geography[index].correctAnswerIndex];
}

function wrongAnswer(index: number) {
  return geography[index].answers.find((_, i) => i !== geography[index].correctAnswerIndex)!;
}

// renderRouter attaches its route helpers to the returned promise, so callers
// keep a reference to it and await it separately.
function renderQuiz(initialUrl = '/quiz/geography') {
  return renderRouter(
    {
      _layout: RootLayout,
      index: HomeScreen,
      'quiz/[categoryId]': QuizScreen,
      'quiz/custom': CustomTopicQuizScreen,
      results: ResultsScreen,
    },
    { initialUrl },
  );
}

async function renderLoadedQuiz() {
  const router = renderQuiz();
  await router;
  await screen.findByRole('header', { name: geography[0].question });
  // Wrapped: returning the promise itself from an async function would unwrap it.
  return { router };
}

async function answerAndContinue(answer: string) {
  await fireEvent.press(screen.getByRole('button', { name: answer }));
  await fireEvent.press(screen.getByRole('button', { name: /לשאלה הבאה|לתוצאות/ }));
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(jsonResponse(200, { questions: geography }));
  global.fetch = fetchMock;
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('<QuizScreen /> generation', () => {
  test('requests a fresh quiz for the category from the API route', async () => {
    await renderLoadedQuiz();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/quiz');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ categoryId: 'geography' });
  });

  test('shows a loading state until the quiz arrives', async () => {
    let respond!: (response: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((resolve) => (respond = resolve)));

    await renderQuiz();

    expect(screen.getByText('מכינים לך שאלות חדשות…')).toBeOnTheScreen();
    expect(screen.queryByRole('header', { name: geography[0].question })).not.toBeOnTheScreen();

    await act(async () => respond(jsonResponse(200, { questions: geography })));

    expect(await screen.findByRole('header', { name: geography[0].question })).toBeOnTheScreen();
    expect(screen.queryByText('מכינים לך שאלות חדשות…')).not.toBeOnTheScreen();
  });

  test('a network failure shows a friendly retry state that can recover', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));

    await renderQuiz();

    expect(
      await screen.findByText('לא הצלחנו להתחבר. כדאי לבדוק את החיבור לאינטרנט ולנסות שוב.'),
    ).toBeOnTheScreen();
    expect(screen.queryByText(/Network request failed/)).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'נסה שוב' }));

    expect(await screen.findByRole('header', { name: geography[0].question })).toBeOnTheScreen();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('a server or OpenAI failure shows a generic retry message', async () => {
    fetchMock.mockResolvedValue(jsonResponse(502, { error: 'unavailable' }));

    await renderQuiz();

    expect(await screen.findByText('משהו השתבש בהכנת המשחק. כדאי לנסות שוב בעוד רגע.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'נסה שוב' })).toBeOnTheScreen();
  });

  test('a refused topic suggests trying another topic', async () => {
    fetchMock.mockResolvedValue(jsonResponse(422, { error: 'refused' }));

    await renderQuiz('/quiz/custom?topic=משהו');

    expect(
      await screen.findByText('לא הצלחנו ליצור שאלות על הנושא הזה. אפשר לנסות שוב או לבחור נושא אחר.'),
    ).toBeOnTheScreen();
  });

  test.each([
    ['too few questions', { questions: geography.slice(0, 4) }],
    ['three answers', { questions: [{ ...geography[0], answers: ['א', 'ב', 'ג'] }, ...geography.slice(1)] }],
    ['an out-of-range correct answer', { questions: [{ ...geography[0], correctAnswerIndex: 4 }, ...geography.slice(1)] }],
    ['a missing explanation', { questions: [{ ...geography[0], explanation: '' }, ...geography.slice(1)] }],
    ['not a quiz at all', { message: 'hello' }],
  ])('a malformed response (%s) shows the retry state', async (_case, body) => {
    fetchMock.mockResolvedValue(jsonResponse(200, body));

    await renderQuiz();

    expect(await screen.findByRole('button', { name: 'נסה שוב' })).toBeOnTheScreen();
    expect(screen.queryByText('שאלה 1 מתוך 5')).not.toBeOnTheScreen();
  });

  test('a custom topic uses the same API with the topic', async () => {
    await renderQuiz('/quiz/custom?topic=%D7%97%D7%9C%D7%9C');

    expect(await screen.findByText('✏️ חלל')).toBeOnTheScreen();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ topic: 'חלל' });
  });

  test('shows a message for an unknown category without calling the API', async () => {
    await renderQuiz('/quiz/unknown');

    expect(screen.getByText('לא מצאנו שאלות בנושא הזה')).toBeOnTheScreen();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('<QuizScreen /> gameplay', () => {
  test('shows the category, progress, question and exactly four answers', async () => {
    await renderLoadedQuiz();

    expect(screen.getByText('🌍 גאוגרפיה')).toBeOnTheScreen();
    expect(screen.getByText('שאלה 1 מתוך 5')).toBeOnTheScreen();
    expect(screen.getAllByRole('button').map((button) => button.props.accessibilityLabel)).toEqual(
      geography[0].answers,
    );
  });

  test('a correct answer increases the score and shows the explanation', async () => {
    await renderLoadedQuiz();

    expect(screen.queryByText(geography[0].explanation)).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: correctAnswer(0) }));

    expect(screen.getByText('ניקוד: 1')).toBeOnTheScreen();
    expect(screen.getByText('תשובה נכונה, כל הכבוד!')).toBeOnTheScreen();
    expect(screen.getByText(geography[0].explanation)).toBeOnTheScreen();
  });

  test('an incorrect answer does not increase the score and reveals the correct answer', async () => {
    await renderLoadedQuiz();

    await fireEvent.press(screen.getByRole('button', { name: wrongAnswer(0) }));

    expect(screen.getByText('ניקוד: 0')).toBeOnTheScreen();
    expect(screen.getByText(`טעות. התשובה הנכונה היא: ${correctAnswer(0)}`)).toBeOnTheScreen();
    expect(screen.getByText(geography[0].explanation)).toBeOnTheScreen();
  });

  test('the answer cannot be changed after selection', async () => {
    await renderLoadedQuiz();

    await fireEvent.press(screen.getByRole('button', { name: wrongAnswer(0) }));
    await fireEvent.press(screen.getByRole('button', { name: correctAnswer(0) }));

    expect(screen.getByText('ניקוד: 0')).toBeOnTheScreen();
    expect(screen.getByText(`טעות. התשובה הנכונה היא: ${correctAnswer(0)}`)).toBeOnTheScreen();
    for (const answer of geography[0].answers) {
      expect(screen.getByRole('button', { name: answer })).toBeDisabled();
    }
  });

  test('the next button appears only after answering and advances to the next question', async () => {
    await renderLoadedQuiz();

    expect(screen.queryByRole('button', { name: 'לשאלה הבאה' })).not.toBeOnTheScreen();

    await answerAndContinue(correctAnswer(0));

    expect(screen.getByText('שאלה 2 מתוך 5')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: geography[1].question })).toBeOnTheScreen();
    expect(screen.getByText('ניקוד: 1')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: correctAnswer(1) })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'לשאלה הבאה' })).not.toBeOnTheScreen();
    expect(screen.queryByText(geography[1].explanation)).not.toBeOnTheScreen();
  });

  test('the last question leads to the results with the final score', async () => {
    const { router } = await renderLoadedQuiz();

    await answerAndContinue(correctAnswer(0));
    await answerAndContinue(wrongAnswer(1));
    await answerAndContinue(correctAnswer(2));
    await answerAndContinue(correctAnswer(3));
    await fireEvent.press(screen.getByRole('button', { name: wrongAnswer(4) }));

    expect(screen.queryByRole('button', { name: 'לשאלה הבאה' })).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'לתוצאות' }));

    expect(router.getPathname()).toBe('/results');
    expect(await screen.findByText('ענית נכון על 3 מתוך 5 שאלות')).toBeOnTheScreen();
  });
});
