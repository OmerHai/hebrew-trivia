import { router as appRouter, type Href } from 'expo-router';
import { act, cleanup, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

import CategoriesScreen from '@/app/categories';
import HomeScreen from '@/app/index';
import QuizScreen from '@/app/quiz/[categoryId]';
import ResultsScreen from '@/app/results';
import RootLayout from '@/app/_layout';
import { LOADING_MESSAGE, WAITING_MESSAGE } from '@/components/generated-quiz';
import { getRecentQuestions } from '@/storage/question-history';
import type { Question } from '@/types/question';

// Keep the generated order so tests know which question is shown.
jest.mock('@/utils/shuffle', () => ({ shuffle: <T,>(items: readonly T[]) => [...items] }));
jest.mock('expo-haptics');

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
  {
    id: 'q6',
    question: 'מהי בירת קנדה?',
    answers: ['טורונטו', 'אוטווה', 'ונקובר', 'מונטריאול'],
    correctAnswerIndex: 1,
    explanation: 'אוטווה היא בירת קנדה מאז 1857.',
  },
  {
    id: 'q7',
    question: 'איזה מדבר הוא הגדול באפריקה?',
    answers: ['קלהארי', 'נמיב', 'סהרה', 'גובי'],
    correctAnswerIndex: 2,
    explanation: 'הסהרה משתרע על פני כ־9 מיליון קמ״ר.',
  },
  {
    id: 'q8',
    question: 'מהו ההר הגבוה בעולם?',
    answers: ['קילימנג׳רו', 'האוורסט', 'מון בלאן', 'K2'],
    correctAnswerIndex: 1,
    explanation: 'האוורסט מתנשא לגובה של כ־8,849 מטרים.',
  },
  {
    id: 'q9',
    question: 'באיזו מדינה נמצאת העיר מרקש?',
    answers: ['תוניסיה', 'מצרים', 'אלג׳יריה', 'מרוקו'],
    correctAnswerIndex: 3,
    explanation: 'מרקש היא אחת הערים הגדולות במרוקו.',
  },
  {
    id: 'q10',
    question: 'מהו הים המלוח ביותר בעולם?',
    answers: ['ים המלח', 'הים התיכון', 'הים האדום', 'הים השחור'],
    correctAnswerIndex: 0,
    explanation: 'מליחות ים המלח גבוהה פי כמה מזו של האוקיינוסים.',
  },
];

const firstBatch = geography.slice(0, 3);
const secondBatch = geography.slice(3);

const originalFetch = global.fetch;
const fetchMock = jest.fn();

function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
}

/** Answers each request with the batch matching its size, like the real API route. */
function respondByBatch(init: RequestInit, questions = geography) {
  const { count } = JSON.parse(init.body as string);
  return Promise.resolve(jsonResponse(200, { questions: count === 3 ? questions.slice(0, 3) : questions.slice(3) }));
}

/** New questions for a follow-up game, so they don't repeat the first game's. */
const moreGeography = geography.map((question) => ({ ...question, question: `שוב: ${question.question}` }));

/**
 * The played-question history once pending updates have settled. Questions are
 * recorded as soon as they join the quiz, so there's nothing to poll for.
 */
async function recentQuestions(scope: string) {
  await act(async () => {});
  return getRecentQuestions(scope);
}

/** Once the current game is fully loaded, goes home and starts another game at `path` with new questions. */
async function playAnotherGame(path: string, scope: string) {
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect(await recentQuestions(scope)).toHaveLength(10);
  fetchMock.mockClear();
  fetchMock.mockImplementation((_url: string, init: RequestInit) => respondByBatch(init, moreGeography));

  await act(async () => appRouter.replace('/'));
  await act(async () => appRouter.push(path as Href));
  await screen.findByRole('header', { name: moreGeography[0].question });
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
}

/** The progress track, which screen readers announce as one element. */
function progress(questionNumber: number, score: number) {
  const correct = score === 1 ? 'תשובה נכונה אחת' : `${score} תשובות נכונות`;
  return screen.getByRole('progressbar', { name: `שאלה ${questionNumber} מתוך 10, ${correct}` });
}

function requestBody(call: number) {
  return JSON.parse(fetchMock.mock.calls[call][1].body);
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
      categories: CategoriesScreen,
      'quiz/[categoryId]': QuizScreen,
      results: ResultsScreen,
    },
    { initialUrl },
  );
}

async function renderLoadedQuiz(initialUrl?: string) {
  const router = renderQuiz(initialUrl);
  await router;
  await screen.findByRole('header', { name: geography[0].question });
  // Wrapped: returning the promise itself from an async function would unwrap it.
  return { router };
}

/** Renders a quiz whose second batch stays pending until `respond` is called. */
async function renderWithPendingSecondBatch() {
  let respond!: (response: Response) => void;
  fetchMock.mockImplementation((_url: string, init: RequestInit) =>
    JSON.parse(init.body as string).count === 3
      ? respondByBatch(init)
      : new Promise<Response>((resolve) => (respond = resolve)),
  );
  const { router } = await renderLoadedQuiz();
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  return { router, respond: (response: Response) => act(async () => respond(response)) };
}

async function answerAndContinue(answer: string) {
  await fireEvent.press(screen.getByRole('button', { name: answer }));
  await fireEvent.press(screen.getByRole('button', { name: /לשאלה הבאה|לתוצאות/ }));
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation((_url: string, init: RequestInit) => respondByBatch(init));
  global.fetch = fetchMock;
});

afterEach(async () => {
  cleanup();
  jest.restoreAllMocks();
  jest.clearAllMocks();
  // Reading the history waits for pending writes, so none lands in the next test.
  await getRecentQuestions('');
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('<QuizScreen /> generation', () => {
  test('requests 3 questions first, then the remaining 7 without repeating them', async () => {
    await renderLoadedQuiz();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/quiz');
    expect(init.method).toBe('POST');
    expect(requestBody(0)).toEqual({ categoryId: 'geography', count: 3, exclude: [] });
    expect(requestBody(1)).toEqual({
      categoryId: 'geography',
      count: 7,
      exclude: firstBatch.map((question) => question.question),
    });
  });

  test('shows a loading state until the first batch arrives', async () => {
    let respond!: (response: Response) => void;
    fetchMock.mockReturnValueOnce(new Promise<Response>((resolve) => (respond = resolve)));

    await renderQuiz();

    expect(await screen.findByText(LOADING_MESSAGE)).toBeOnTheScreen();
    expect(screen.queryByRole('header', { name: geography[0].question })).not.toBeOnTheScreen();

    await act(async () => respond(jsonResponse(200, { questions: firstBatch })));

    expect(await screen.findByRole('header', { name: geography[0].question })).toBeOnTheScreen();
    expect(screen.queryByText(LOADING_MESSAGE)).not.toBeOnTheScreen();
  });

  test('the game starts after the first batch and shows progress out of 10', async () => {
    await renderWithPendingSecondBatch();

    expect(screen.getByRole('header', { name: geography[0].question })).toBeOnTheScreen();
    expect(progress(1, 0)).toBeOnTheScreen();
  });

  test('reaching the end of the ready questions waits for the rest and then continues on its own', async () => {
    const { respond } = await renderWithPendingSecondBatch();

    await answerAndContinue(correctAnswer(0));
    await answerAndContinue(correctAnswer(1));
    await answerAndContinue(correctAnswer(2));

    expect(screen.getByText(WAITING_MESSAGE)).toBeOnTheScreen();
    expect(progress(4, 3)).toBeOnTheScreen();

    await respond(jsonResponse(200, { questions: secondBatch }));

    expect(await screen.findByRole('header', { name: geography[3].question })).toBeOnTheScreen();
    expect(screen.queryByText(WAITING_MESSAGE)).not.toBeOnTheScreen();
    expect(progress(4, 3)).toBeOnTheScreen();
  });

  test('a background failure while playing does not interrupt the ready questions', async () => {
    const { respond } = await renderWithPendingSecondBatch();

    await respond(jsonResponse(502, { error: 'unavailable' }));

    expect(screen.getByRole('header', { name: geography[0].question })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'לנסות שוב' })).not.toBeOnTheScreen();
  });

  test('a background failure shows the retry state at the end of the ready questions, and retry continues the game', async () => {
    const { respond } = await renderWithPendingSecondBatch();
    await respond(jsonResponse(502, { error: 'unavailable' }));

    await answerAndContinue(correctAnswer(0));
    await answerAndContinue(wrongAnswer(1));
    await answerAndContinue(correctAnswer(2));

    expect(await screen.findByText('לא הצלחנו להכין את המשחק. כדאי לנסות שוב בעוד רגע.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'לתוצאות' })).not.toBeOnTheScreen();

    fetchMock.mockImplementation((_url: string, init: RequestInit) => respondByBatch(init));
    await fireEvent.press(screen.getByRole('button', { name: 'לנסות שוב' }));

    expect(await screen.findByRole('header', { name: geography[3].question })).toBeOnTheScreen();
    expect(progress(4, 2)).toBeOnTheScreen();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(requestBody(2)).toMatchObject({ count: 7, exclude: firstBatch.map((question) => question.question) });
  });

  test('a second batch repeating a question already in this game is rejected', async () => {
    fetchMock.mockImplementation((_url: string, init: RequestInit) =>
      JSON.parse(init.body as string).count === 3
        ? respondByBatch(init)
        : Promise.resolve(jsonResponse(200, { questions: [firstBatch[0], ...secondBatch.slice(1)] })),
    );
    await renderLoadedQuiz();

    await answerAndContinue(correctAnswer(0));
    await answerAndContinue(correctAnswer(1));
    await answerAndContinue(correctAnswer(2));

    expect(await screen.findByRole('button', { name: 'לנסות שוב' })).toBeOnTheScreen();
    expect(screen.queryByRole('header', { name: geography[0].question })).not.toBeOnTheScreen();
  });

  test('a network failure shows a friendly retry state that can recover', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));

    await renderQuiz();

    expect(
      await screen.findByText('לא הצלחנו להתחבר. כדאי לבדוק את החיבור לאינטרנט ולנסות שוב.'),
    ).toBeOnTheScreen();
    expect(screen.queryByText(/Network request failed/)).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'לנסות שוב' }));

    expect(await screen.findByRole('header', { name: geography[0].question })).toBeOnTheScreen();
    expect(requestBody(1)).toMatchObject({ count: 3 });
  });

  test('a server or OpenAI failure shows a generic retry message', async () => {
    fetchMock.mockResolvedValue(jsonResponse(502, { error: 'unavailable' }));

    await renderQuiz();

    expect(await screen.findByText('לא הצלחנו להכין את המשחק. כדאי לנסות שוב בעוד רגע.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'לנסות שוב' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'לבחור נושא אחר' })).toBeOnTheScreen();
  });

  test('a refused request suggests trying another topic', async () => {
    fetchMock.mockResolvedValue(jsonResponse(422, { error: 'refused' }));

    await renderQuiz();

    expect(
      await screen.findByText('לא הצלחנו ליצור שאלות על הנושא הזה. אפשר לנסות שוב או לבחור נושא אחר.'),
    ).toBeOnTheScreen();
  });

  test.each([
    ['too few questions', { questions: firstBatch.slice(0, 2) }],
    ['a repeated question', { questions: [firstBatch[0], firstBatch[0], firstBatch[2]] }],
    ['three answers', { questions: [{ ...firstBatch[0], answers: ['א', 'ב', 'ג'] }, ...firstBatch.slice(1)] }],
    ['an out-of-range correct answer', { questions: [{ ...firstBatch[0], correctAnswerIndex: 4 }, ...firstBatch.slice(1)] }],
    ['a missing explanation', { questions: [{ ...firstBatch[0], explanation: '' }, ...firstBatch.slice(1)] }],
    [
      'a question containing its answer',
      { questions: [{ ...firstBatch[0], question: 'האם קנברה היא בירת אוסטרליה?' }, ...firstBatch.slice(1)] },
    ],
    ['not a quiz at all', { message: 'hello' }],
  ])('a malformed response (%s) shows the retry state', async (_case, body) => {
    fetchMock.mockResolvedValue(jsonResponse(200, body));

    await renderQuiz();

    expect(await screen.findByRole('button', { name: 'לנסות שוב' })).toBeOnTheScreen();
    expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen();
  });

  test('shows a message for an unknown category without calling the API', async () => {
    await renderQuiz('/quiz/unknown');

    expect(screen.getByRole('header', { name: 'לא מצאנו את הנושא הזה' })).toBeOnTheScreen();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('<QuizScreen /> played-question history', () => {
  test('questions are recorded once they join the quiz', async () => {
    const { respond } = await renderWithPendingSecondBatch();

    expect(await recentQuestions('category:geography')).toEqual(
      firstBatch.map((question) => question.question).reverse(),
    );

    await respond(jsonResponse(200, { questions: secondBatch }));

    expect(await recentQuestions('category:geography')).toEqual(
      geography.map((question) => question.question).reverse(),
    );
  });

  test('questions from a failed background batch are not recorded', async () => {
    const { respond } = await renderWithPendingSecondBatch();
    await respond(jsonResponse(502, { error: 'unavailable' }));

    expect(await recentQuestions('category:geography')).toHaveLength(3);
  });

  test('the next game in the same category excludes the questions of the previous one', async () => {
    await renderLoadedQuiz();
    await playAnotherGame('/quiz/geography', 'category:geography');

    const played = geography.map((question) => question.question).reverse();
    expect(requestBody(0)).toEqual({ categoryId: 'geography', count: 3, exclude: played });
    expect(requestBody(1).exclude).toEqual([
      ...played,
      ...moreGeography.slice(0, 3).map((question) => question.question),
    ]);
  });

  test('another category does not receive this category’s history', async () => {
    await renderLoadedQuiz();
    await playAnotherGame('/quiz/technology', 'category:geography');

    expect(requestBody(0)).toEqual({ categoryId: 'technology', count: 3, exclude: [] });
  });

  test('football and sports keep separate histories', async () => {
    await renderLoadedQuiz('/quiz/football');
    await playAnotherGame('/quiz/sports', 'category:football');

    expect(requestBody(0)).toEqual({ categoryId: 'sports', count: 3, exclude: [] });
    expect(await recentQuestions('category:sports')).toHaveLength(10);
    expect(await recentQuestions('category:football')).toEqual(
      geography.map((question) => question.question).reverse(),
    );
  });
});


describe('<QuizScreen /> gameplay', () => {
  test('shows the progress track, the question and exactly four lettered answers', async () => {
    await renderLoadedQuiz();

    expect(progress(1, 0)).toBeOnTheScreen();
    expect(screen.getAllByRole('button').map((button) => button.props.accessibilityLabel)).toEqual(
      geography[0].answers,
    );
    // Decorative: each button's accessible name is its answer.
    for (const letter of ['א', 'ב', 'ג', 'ד']) {
      expect(screen.getByText(letter, { includeHiddenElements: true })).toBeOnTheScreen();
    }
  });

  test('before answering, every answer is neutral and enabled', async () => {
    await renderLoadedQuiz();

    for (const answer of geography[0].answers) {
      const button = screen.getByRole('button', { name: answer });
      expect(button).toBeEnabled();
      expect(button).not.toBeSelected();
      expect(button.props.accessibilityValue?.text).toBeUndefined();
    }
  });

  test('a correct answer marks it correct, increases the score and shows the explanation', async () => {
    await renderLoadedQuiz();

    expect(screen.queryByText(geography[0].explanation)).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: correctAnswer(0) }));

    expect(progress(1, 1)).toBeOnTheScreen();
    expect(screen.getByText('נכון!')).toBeOnTheScreen();
    expect(screen.getByText(geography[0].explanation)).toBeOnTheScreen();
    const picked = screen.getByRole('button', { name: correctAnswer(0) });
    expect(picked).toBeSelected();
    expect(picked).toHaveAccessibilityValue({ text: 'התשובה הנכונה' });
  });

  test('a wrong answer is marked wrong, the correct one is revealed, and the rest fade', async () => {
    await renderLoadedQuiz();

    await fireEvent.press(screen.getByRole('button', { name: wrongAnswer(0) }));

    expect(progress(1, 0)).toBeOnTheScreen();
    expect(screen.getByText('לא הפעם')).toBeOnTheScreen();
    expect(screen.getByText(geography[0].explanation)).toBeOnTheScreen();
    // The correct answer isn't repeated in the feedback: its button shows it.
    expect(screen.getAllByText(correctAnswer(0))).toHaveLength(1);
    expect(screen.getByRole('button', { name: wrongAnswer(0) })).toHaveAccessibilityValue({ text: 'תשובה שגויה' });
    expect(screen.getByRole('button', { name: correctAnswer(0) })).toHaveAccessibilityValue({
      text: 'התשובה הנכונה',
    });
    const others = geography[0].answers.filter((answer) => answer !== correctAnswer(0) && answer !== wrongAnswer(0));
    for (const answer of others) {
      expect(screen.getByRole('button', { name: answer }).props.accessibilityValue?.text).toBeUndefined();
    }
  });

  test('answering gives subtle haptic feedback: success when right, error when wrong', async () => {
    await renderLoadedQuiz();

    await answerAndContinue(correctAnswer(0));
    await fireEvent.press(screen.getByRole('button', { name: wrongAnswer(1) }));

    expect(Haptics.notificationAsync).toHaveBeenNthCalledWith(1, Haptics.NotificationFeedbackType.Success);
    expect(Haptics.notificationAsync).toHaveBeenNthCalledWith(2, Haptics.NotificationFeedbackType.Error);
  });

  test('the answer cannot be changed after selection', async () => {
    await renderLoadedQuiz();

    await fireEvent.press(screen.getByRole('button', { name: wrongAnswer(0) }));
    await fireEvent.press(screen.getByRole('button', { name: correctAnswer(0) }));

    expect(progress(1, 0)).toBeOnTheScreen();
    expect(screen.getByText('לא הפעם')).toBeOnTheScreen();
    for (const answer of geography[0].answers) {
      expect(screen.getByRole('button', { name: answer })).toBeDisabled();
    }
  });

  test('the next button appears only after answering and advances to the next question', async () => {
    await renderLoadedQuiz();

    expect(screen.queryByRole('button', { name: 'לשאלה הבאה' })).not.toBeOnTheScreen();

    await answerAndContinue(correctAnswer(0));

    expect(progress(2, 1)).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: geography[1].question })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: correctAnswer(1) })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'לשאלה הבאה' })).not.toBeOnTheScreen();
    expect(screen.queryByText(geography[1].explanation)).not.toBeOnTheScreen();
  });

  test('the player completes all 10 questions and the results show the category, score and track', async () => {
    const { router } = await renderLoadedQuiz();

    const correct = [0, 2, 3, 5, 6, 8];
    for (let index = 0; index < 9; index++) {
      await screen.findByRole('header', { name: geography[index].question });
      expect(progress(index + 1, correct.filter((i) => i < index).length)).toBeOnTheScreen();
      await answerAndContinue(correct.includes(index) ? correctAnswer(index) : wrongAnswer(index));
    }

    expect(await screen.findByRole('header', { name: geography[9].question })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: correctAnswer(9) }));

    expect(screen.queryByRole('button', { name: 'לשאלה הבאה' })).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'לתוצאות' }));

    expect(router.getPathname()).toBe('/results');
    expect(router.getSearchParams()).toEqual({ categoryId: 'geography', track: '1011011011' });
    expect(await screen.findByLabelText('7 מתוך 10')).toBeOnTheScreen();
    expect(screen.getByText('גאוגרפיה')).toBeOnTheScreen();
    expect(screen.getByRole('progressbar', { name: '7 תשובות נכונות מתוך 10' })).toBeOnTheScreen();
  });
});

describe('<QuizScreen /> leaving a game', () => {
  /** Opens the quiz from the categories screen, so there is a screen to go back to. */
  async function renderFromCategories() {
    const router = renderQuiz('/categories');
    await router;
    await fireEvent.press(screen.getByRole('button', { name: 'גאוגרפיה' }));
    await screen.findByRole('header', { name: geography[0].question });
    return { router };
  }

  test('going back before answering anything leaves without asking', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { router } = await renderFromCategories();

    await act(async () => appRouter.back());

    expect(alert).not.toHaveBeenCalled();
    expect(router.getPathname()).toBe('/categories');
  });

  test('going back mid-game asks first, and staying keeps the game', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { router } = await renderFromCategories();
    await answerAndContinue(correctAnswer(0));

    await act(async () => appRouter.back());

    expect(alert).toHaveBeenCalledWith('לצאת מהמשחק?', expect.any(String), expect.any(Array));
    expect(router.getPathname()).toBe('/quiz/geography');

    const [stay] = alert.mock.calls[0][2]!;
    expect(stay.text).toBe('להמשיך לשחק');
    await act(async () => stay.onPress?.());

    expect(router.getPathname()).toBe('/quiz/geography');
    expect(progress(2, 1)).toBeOnTheScreen();
  });

  test('confirming the exit discards the game', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { router } = await renderFromCategories();
    await fireEvent.press(screen.getByRole('button', { name: correctAnswer(0) }));

    await act(async () => appRouter.back());
    const [, leave] = alert.mock.calls[0][2]!;
    expect(leave.text).toBe('לצאת');
    await act(async () => leave.onPress?.());

    expect(router.getPathname()).toBe('/categories');
  });

  test('choosing another topic from a mid-game error leaves without asking', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    fetchMock.mockImplementation((_url: string, init: RequestInit) =>
      JSON.parse(init.body as string).count === 3
        ? respondByBatch(init)
        : Promise.resolve(jsonResponse(502, { error: 'unavailable' })),
    );
    const { router } = await renderFromCategories();

    await answerAndContinue(correctAnswer(0));
    await answerAndContinue(correctAnswer(1));
    await answerAndContinue(correctAnswer(2));
    await fireEvent.press(await screen.findByRole('button', { name: 'לבחור נושא אחר' }));

    expect(alert).not.toHaveBeenCalled();
    expect(router.getPathname()).toBe('/categories');
  });

  test('finishing the game goes to the results without asking', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { router } = await renderFromCategories();

    for (let index = 0; index < 10; index++) {
      await screen.findByRole('header', { name: geography[index].question });
      await answerAndContinue(correctAnswer(index));
    }

    expect(alert).not.toHaveBeenCalled();
    expect(router.getPathname()).toBe('/results');
  });
});
