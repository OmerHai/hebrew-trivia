import { useState } from 'react';

import type { Question } from '@/types/question';

type QuizState = {
  index: number;
  score: number;
  selectedIndex: number | null;
};

/**
 * Game state for a quiz of `total` questions. `questions` may still be growing
 * while the rest of the quiz loads; `question` is `undefined` when the player
 * has reached a question that hasn't arrived yet.
 */
export function useQuiz(questions: readonly Question[], total = questions.length) {
  const [state, setState] = useState<QuizState>({ index: 0, score: 0, selectedIndex: null });
  const question: Question | undefined = questions[state.index];

  // Functional updates so a rapid double tap can't answer twice or skip a question.
  const selectAnswer = (answerIndex: number) =>
    setState((current) => {
      const answered = questions[current.index];
      if (current.selectedIndex !== null || !answered) return current;
      const isCorrect = answerIndex === answered.correctAnswerIndex;
      return { ...current, selectedIndex: answerIndex, score: current.score + (isCorrect ? 1 : 0) };
    });

  const nextQuestion = () =>
    setState((current) => {
      if (current.selectedIndex === null || current.index >= total - 1) return current;
      return { ...current, index: current.index + 1, selectedIndex: null };
    });

  return {
    question,
    questionNumber: state.index + 1,
    total,
    score: state.score,
    selectedIndex: state.selectedIndex,
    isAnswered: state.selectedIndex !== null,
    isLastQuestion: state.index === total - 1,
    selectAnswer,
    nextQuestion,
  };
}
