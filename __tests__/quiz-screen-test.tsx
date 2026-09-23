import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';

import HomeScreen from '@/app/index';
import QuizScreen from '@/app/quiz/[categoryId]';
import ResultsScreen from '@/app/results';
import RootLayout from '@/app/_layout';
import { getQuestionsByCategory } from '@/data/questions';

// Keep the data-layer order so tests know which question is shown.
jest.mock('@/utils/shuffle', () => ({ shuffle: <T,>(items: readonly T[]) => [...items] }));

const geography = getQuestionsByCategory('geography');

function correctAnswer(index: number) {
  return geography[index].answers[geography[index].correctIndex];
}

function wrongAnswer(index: number) {
  return geography[index].answers.find((_, i) => i !== geography[index].correctIndex)!;
}

// renderRouter attaches its route helpers to the returned promise, so callers
// keep a reference to it and await it separately.
function renderQuiz(initialUrl = '/quiz/geography') {
  return renderRouter(
    {
      _layout: RootLayout,
      index: HomeScreen,
      'quiz/[categoryId]': QuizScreen,
      results: ResultsScreen,
    },
    { initialUrl },
  );
}

async function answerAndContinue(answer: string) {
  await fireEvent.press(screen.getByRole('button', { name: answer }));
  await fireEvent.press(screen.getByRole('button', { name: /לשאלה הבאה|לתוצאות/ }));
}

describe('<QuizScreen />', () => {
  test('shows the category, progress, question and exactly four answers', async () => {
    await renderQuiz();

    expect(screen.getByText('🌍 גאוגרפיה')).toBeOnTheScreen();
    expect(screen.getByText('שאלה 1 מתוך 5')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: geography[0].question })).toBeOnTheScreen();
    expect(screen.getAllByRole('button').map((button) => button.props.accessibilityLabel)).toEqual(
      geography[0].answers,
    );
  });

  test('a correct answer increases the score', async () => {
    await renderQuiz();

    await fireEvent.press(screen.getByRole('button', { name: correctAnswer(0) }));

    expect(screen.getByText('ניקוד: 1')).toBeOnTheScreen();
    expect(screen.getByText('תשובה נכונה, כל הכבוד!')).toBeOnTheScreen();
  });

  test('an incorrect answer does not increase the score and reveals the correct answer', async () => {
    await renderQuiz();

    await fireEvent.press(screen.getByRole('button', { name: wrongAnswer(0) }));

    expect(screen.getByText('ניקוד: 0')).toBeOnTheScreen();
    expect(screen.getByText(`טעות. התשובה הנכונה היא: ${correctAnswer(0)}`)).toBeOnTheScreen();
  });

  test('the answer cannot be changed after selection', async () => {
    await renderQuiz();

    await fireEvent.press(screen.getByRole('button', { name: wrongAnswer(0) }));
    await fireEvent.press(screen.getByRole('button', { name: correctAnswer(0) }));

    expect(screen.getByText('ניקוד: 0')).toBeOnTheScreen();
    expect(screen.getByText(`טעות. התשובה הנכונה היא: ${correctAnswer(0)}`)).toBeOnTheScreen();
    for (const answer of geography[0].answers) {
      expect(screen.getByRole('button', { name: answer })).toBeDisabled();
    }
  });

  test('the next button appears only after answering and advances to the next question', async () => {
    await renderQuiz();

    expect(screen.queryByRole('button', { name: 'לשאלה הבאה' })).not.toBeOnTheScreen();

    await answerAndContinue(correctAnswer(0));

    expect(screen.getByText('שאלה 2 מתוך 5')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: geography[1].question })).toBeOnTheScreen();
    expect(screen.getByText('ניקוד: 1')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: correctAnswer(1) })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'לשאלה הבאה' })).not.toBeOnTheScreen();
  });

  test('the last question leads to the results with the final score', async () => {
    const router = renderQuiz();
    await router;

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

  test('shows a message for an unknown category', async () => {
    await renderQuiz('/quiz/unknown');

    expect(screen.getByText('לא מצאנו שאלות בנושא הזה')).toBeOnTheScreen();
  });
});
