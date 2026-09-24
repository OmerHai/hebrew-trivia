import { z } from 'zod';

import { normalizeText } from '@/utils/question-text';

export const QUESTIONS_PER_QUIZ = 10;
/** The game starts as soon as this many questions are ready; the rest arrive in the background. */
export const FIRST_BATCH_SIZE = 3;
export const MAX_TOPIC_LENGTH = 60;
/** Upper bounds for the exclusion list sent with a request, to keep prompts small. */
export const MAX_EXCLUDED_QUESTIONS = 40;
export const MAX_EXCLUDED_QUESTION_LENGTH = 300;

/** A generated quiz is requested either for a built-in category or for a free-text topic. */
export type QuizRequest = { categoryId: string; topic?: never } | { topic: string; categoryId?: never };

/**
 * One generation request: `count` new questions that must not repeat any of the
 * `exclude` questions (recently played ones and those already in this game).
 */
export type QuizBatchRequest = QuizRequest & { count: number; exclude: string[] };

// Structured Outputs supports `pattern` but not `minLength`, so patterns keep
// strings non-empty; question and explanation must contain Hebrew letters.
const nonEmptyText = z.string().regex(/\S/);
const hebrewText = z.string().regex(/[א-ת]/);

/**
 * The shape the model must return for a batch of `count` questions (Structured
 * Outputs). It stays within the JSON Schema subset OpenAI supports; stricter
 * rules are enforced by `quizBatchSchema`.
 */
export function generatedQuizSchema(count: number) {
  return z.object({
    questions: z
      .array(
        z.object({
          question: hebrewText,
          answers: z.array(nonEmptyText).length(4),
          correctAnswerIndex: z.number().int().min(0).max(3),
          explanation: hebrewText,
        }),
      )
      .length(count),
  });
}

const text = z.string().trim().min(1);

const questionSchema = z
  .object({
    id: text,
    question: text,
    answers: z.tuple([text, text, text, text]),
    correctAnswerIndex: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
    explanation: text,
  })
  .refine((question) => new Set(question.answers).size === question.answers.length, {
    message: 'Answers must be distinct',
  });

/**
 * A playable batch of exactly `count` questions: validated on the server before
 * sending and again on the client. Questions must not repeat each other or any
 * excluded question, ignoring case, punctuation and vowel marks.
 */
export function quizBatchSchema(count: number, exclude: readonly string[] = []) {
  const excluded = new Set(exclude.map(normalizeText));
  return z.object({
    questions: z
      .array(questionSchema)
      .length(count)
      .refine((questions) => new Set(questions.map((q) => q.id)).size === questions.length, {
        message: 'Question ids must be unique',
      })
      .refine((questions) => new Set(questions.map((q) => normalizeText(q.question))).size === questions.length, {
        message: 'Questions must not repeat',
      })
      .refine((questions) => questions.every((q) => !excluded.has(normalizeText(q.question))), {
        message: 'Questions must not repeat excluded questions',
      }),
  });
}
