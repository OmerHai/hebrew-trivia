import { useState } from 'react';

import type { Question } from '@/types/question';
import { shuffle } from '@/utils/shuffle';

type QuizState = {
  index: number;
  score: number;
  selectedIndex: number | null;
};

export function useQuiz(questions: readonly Question[]) {
  // Shuffle once per game; the order stays stable across re-renders.
  const [deck] = useState(() => shuffle(questions));
  const [state, setState] = useState<QuizState>({ index: 0, score: 0, selectedIndex: null });

  // Functional updates so a rapid double tap can't answer twice or skip a question.
  const selectAnswer = (answerIndex: number) =>
    setState((current) => {
      if (current.selectedIndex !== null) return current;
      const isCorrect = answerIndex === deck[current.index].correctAnswerIndex;
      return { ...current, selectedIndex: answerIndex, score: current.score + (isCorrect ? 1 : 0) };
    });

  const nextQuestion = () =>
    setState((current) => {
      if (current.selectedIndex === null || current.index >= deck.length - 1) return current;
      return { ...current, index: current.index + 1, selectedIndex: null };
    });

  return {
    question: deck[state.index],
    questionNumber: state.index + 1,
    total: deck.length,
    score: state.score,
    selectedIndex: state.selectedIndex,
    isAnswered: state.selectedIndex !== null,
    isLastQuestion: state.index === deck.length - 1,
    selectAnswer,
    nextQuestion,
  };
}
