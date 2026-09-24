import type { Question } from '@/types/question';
import { quizBatchSchema, type QuizBatchRequest } from '@/utils/quiz-schema';

/** Why a quiz could not be loaded, as far as the player needs to know. */
export type QuizErrorKind = 'network' | 'refused' | 'failed';

export class QuizRequestError extends Error {
  constructor(readonly kind: QuizErrorKind) {
    super(`Quiz request failed: ${kind}`);
    this.name = 'QuizRequestError';
  }
}

/**
 * Asks the app's API route for a batch of freshly generated questions and
 * validates the response, including that no excluded question came back.
 */
export async function fetchQuizBatch(request: QuizBatchRequest, signal?: AbortSignal): Promise<Question[]> {
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

  const batch = quizBatchSchema(request.count, request.exclude).safeParse(body);
  if (!batch.success) throw new QuizRequestError('failed');
  return batch.data.questions;
}
