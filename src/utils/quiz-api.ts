import type { Question } from '@/types/question';
import { quizSchema, type QuizRequest } from '@/utils/quiz-schema';

/** Why a quiz could not be loaded, as far as the player needs to know. */
export type QuizErrorKind = 'network' | 'refused' | 'failed';

export class QuizRequestError extends Error {
  constructor(readonly kind: QuizErrorKind) {
    super(`Quiz request failed: ${kind}`);
    this.name = 'QuizRequestError';
  }
}

/** Asks the app's API route for a freshly generated quiz and validates the response. */
export async function fetchQuiz(request: QuizRequest, signal?: AbortSignal): Promise<Question[]> {
  let response: Response;
  try {
    response = await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
  } catch {
    throw new QuizRequestError('network');
  }

  if (!response.ok) {
    throw new QuizRequestError(response.status === 422 ? 'refused' : 'failed');
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new QuizRequestError('failed');
  }

  const quiz = quizSchema.safeParse(body);
  if (!quiz.success) throw new QuizRequestError('failed');
  return quiz.data.questions;
}
