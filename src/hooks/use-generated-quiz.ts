import { useEffect, useState } from 'react';

import { addPlayedQuestions, getRecentQuestions, historyScope } from '@/storage/question-history';
import type { Question } from '@/types/question';
import { fetchQuizBatch, QuizRequestError, type QuizErrorKind } from '@/utils/quiz-api';
import { FIRST_BATCH_SIZE, QUESTIONS_PER_QUIZ } from '@/utils/quiz-schema';
import { shuffle } from '@/utils/shuffle';

type Background = { status: 'loading' } | { status: 'done' } | { status: 'error'; error: QuizErrorKind };

type GeneratedQuizState =
  | { status: 'loading' }
  | { status: 'error'; error: QuizErrorKind }
  | {
      status: 'playing';
      /** The questions ready so far; grows to `QUESTIONS_PER_QUIZ`. */
      questions: Question[];
      /** Recently played questions of this category, sent as exclusions. */
      recent: string[];
      /** The request for the rest of the questions. */
      background: Background;
    };

function toErrorKind(error: unknown): QuizErrorKind {
  return error instanceof QuizRequestError ? error.kind : 'failed';
}

/** Shuffles a new batch and appends it, numbering ids across the whole game. */
function appendBatch(questions: readonly Question[], batch: readonly Question[]): Question[] {
  const appended = [...questions, ...shuffle(batch)];
  return appended.map((question, index) => ({ ...question, id: `q${index + 1}` }));
}

/**
 * Loads a freshly generated quiz for the category. The game can start once the
 * first `FIRST_BATCH_SIZE` questions are ready; the rest are requested right
 * away in the background and appended when they arrive. Questions played
 * recently in the same category are excluded, and every question that
 * joins the quiz is recorded in the on-device history.
 */
export function useGeneratedQuiz(categoryId: string) {
  const [game, setGame] = useState(0);
  const [state, setState] = useState<GeneratedQuizState>({ status: 'loading' });

  // The first batch: starts (or restarts) the game.
  useEffect(() => {
    const controller = new AbortController();
    const scope = historyScope(categoryId);

    (async () => {
      const recent = await getRecentQuestions(scope);
      const batch = await fetchQuizBatch({ categoryId, count: FIRST_BATCH_SIZE, exclude: recent }, controller.signal);
      if (controller.signal.aborted) return;
      setState({ status: 'playing', questions: appendBatch([], batch), recent, background: { status: 'loading' } });
      void addPlayedQuestions(scope, batch.map((question) => question.question));
    })().catch((error: unknown) => {
      if (!controller.signal.aborted) setState({ status: 'error', error: toErrorKind(error) });
    });

    return () => controller.abort();
  }, [categoryId, game]);

  // The rest of the questions, requested as soon as the game starts (and again on retry).
  const loadingRest = state.status === 'playing' && state.background.status === 'loading';
  const questions = state.status === 'playing' ? state.questions : null;
  const recent = state.status === 'playing' ? state.recent : null;

  useEffect(() => {
    if (!loadingRest || !questions || !recent) return;
    const controller = new AbortController();
    const scope = historyScope(categoryId);
    const exclude = [...recent, ...questions.map((question) => question.question)];

    fetchQuizBatch({ categoryId, count: QUESTIONS_PER_QUIZ - questions.length, exclude }, controller.signal).then(
      (batch) => {
        if (controller.signal.aborted) return;
        setState({ status: 'playing', questions: appendBatch(questions, batch), recent, background: { status: 'done' } });
        void addPlayedQuestions(scope, batch.map((question) => question.question));
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: 'playing', questions, recent, background: { status: 'error', error: toErrorKind(error) } });
      },
    );

    return () => controller.abort();
  }, [loadingRest, questions, recent, categoryId]);

  const retry = () => {
    if (state.status === 'playing') {
      // Keep the game going and ask again only for the missing questions.
      setState({ ...state, background: { status: 'loading' } });
    } else {
      setState({ status: 'loading' });
      setGame((current) => current + 1);
    }
  };

  if (state.status !== 'playing') return { ...state, retry };
  return {
    status: state.status,
    questions: state.questions,
    total: QUESTIONS_PER_QUIZ,
    backgroundError: state.background.status === 'error' ? state.background.error : null,
    retry,
  };
}
