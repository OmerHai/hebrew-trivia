import { categories } from '@/data/categories';
import { generateQuiz, QuizGenerationError } from '@/server/quiz-generator';
import { MAX_TOPIC_LENGTH } from '@/utils/quiz-schema';

const STATUS_BY_FAILURE = { refused: 422, unavailable: 502, misconfigured: 500 } as const;

/**
 * POST /api/quiz with `{ categoryId }` or `{ topic }`.
 * Responds with `{ questions }`, or `{ error }` holding a short error code — never raw details.
 */
export async function POST(request: Request) {
  const topic = await readTopic(request);
  if (!topic) {
    return Response.json({ error: 'invalid_request' }, { status: 400 });
  }

  try {
    const questions = await generateQuiz(topic);
    return Response.json({ questions });
  } catch (error) {
    const reason = error instanceof QuizGenerationError ? error.reason : 'unavailable';
    return Response.json({ error: reason }, { status: STATUS_BY_FAILURE[reason] });
  }
}

async function readTopic(request: Request): Promise<string | null> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return null;
  }
  if (typeof body !== 'object' || body === null) return null;

  if ('categoryId' in body) {
    return categories.find((category) => category.id === body.categoryId)?.name ?? null;
  }
  if ('topic' in body && typeof body.topic === 'string') {
    const topic = body.topic.trim();
    return topic && topic.length <= MAX_TOPIC_LENGTH ? topic : null;
  }
  return null;
}
