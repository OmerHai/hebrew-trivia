import { categories } from '@/data/categories';
import { generateQuizBatch, QuizGenerationError, type QuizBatchOptions } from '@/server/quiz-generator';
import {
  MAX_EXCLUDED_QUESTION_LENGTH,
  MAX_EXCLUDED_QUESTIONS,
  MAX_TOPIC_LENGTH,
  QUESTIONS_PER_QUIZ,
} from '@/utils/quiz-schema';

const STATUS_BY_FAILURE = { refused: 422, unavailable: 502, misconfigured: 500 } as const;

/**
 * POST /api/quiz with `{ categoryId }` or `{ topic }`, plus `count` (questions
 * to generate) and `exclude` (questions that must not repeat).
 * Responds with `{ questions }`, or `{ error }` holding a short error code — never raw details.
 */
export async function POST(request: Request) {
  const options = await readOptions(request);
  if (!options) {
    return Response.json({ error: 'invalid_request' }, { status: 400 });
  }

  try {
    const questions = await generateQuizBatch(options);
    return Response.json({ questions });
  } catch (error) {
    const reason = error instanceof QuizGenerationError ? error.reason : 'unavailable';
    return Response.json({ error: reason }, { status: STATUS_BY_FAILURE[reason] });
  }
}

async function readOptions(request: Request): Promise<QuizBatchOptions | null> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return null;
  }
  if (typeof body !== 'object' || body === null) return null;

  const topic = readTopic(body);
  if (!topic) return null;

  const count = 'count' in body ? body.count : undefined;
  if (typeof count !== 'number' || !Number.isInteger(count) || count < 1 || count > QUESTIONS_PER_QUIZ) {
    return null;
  }

  const exclude = 'exclude' in body ? body.exclude : [];
  if (
    !Array.isArray(exclude) ||
    exclude.length > MAX_EXCLUDED_QUESTIONS ||
    !exclude.every((item) => typeof item === 'string' && item.length <= MAX_EXCLUDED_QUESTION_LENGTH)
  ) {
    return null;
  }

  return { topic, count, exclude: (exclude as string[]).map((item) => item.trim()).filter(Boolean) };
}

function readTopic(body: object): string | null {
  if ('categoryId' in body) {
    return categories.find((category) => category.id === body.categoryId)?.name ?? null;
  }
  if ('topic' in body && typeof body.topic === 'string') {
    const topic = body.topic.trim();
    return topic && topic.length <= MAX_TOPIC_LENGTH ? topic : null;
  }
  return null;
}
