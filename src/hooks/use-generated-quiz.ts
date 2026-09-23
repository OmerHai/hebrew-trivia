import { useEffect, useState } from 'react';

import type { Question } from '@/types/question';
import { fetchQuiz, QuizRequestError, type QuizErrorKind } from '@/utils/quiz-api';
import type { QuizRequest } from '@/utils/quiz-schema';

type GeneratedQuizState =
  | { status: 'loading' }
  | { status: 'error'; error: QuizErrorKind }
  | { status: 'success'; questions: Question[] };

/** Loads a freshly generated quiz for the request, with a manual retry. */
export function useGeneratedQuiz({ categoryId, topic }: QuizRequest) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<GeneratedQuizState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    const request: QuizRequest = categoryId !== undefined ? { categoryId } : { topic: topic ?? '' };

    fetchQuiz(request, controller.signal).then(
      (questions) => {
        if (!controller.signal.aborted) setState({ status: 'success', questions });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', error: error instanceof QuizRequestError ? error.kind : 'failed' });
      },
    );

    return () => controller.abort();
  }, [categoryId, topic, attempt]);

  const retry = () => {
    setState({ status: 'loading' });
    setAttempt((current) => current + 1);
  };

  return { ...state, retry };
}
