import { z } from 'zod';

export const QUESTIONS_PER_QUIZ = 5;
export const MAX_TOPIC_LENGTH = 60;

/** A generated quiz is requested either for a built-in category or for a free-text topic. */
export type QuizRequest = { categoryId: string; topic?: never } | { topic: string; categoryId?: never };

/**
 * The shape the model must return (Structured Outputs). It stays within the
 * JSON Schema subset OpenAI supports; stricter rules are enforced by `quizSchema`.
 */
export const generatedQuizSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        answers: z.array(z.string()).length(4),
        correctAnswerIndex: z.number().int().min(0).max(3),
        explanation: z.string(),
      }),
    )
    .length(QUESTIONS_PER_QUIZ),
});

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

/** A playable quiz: validated on the server before sending and again on the client. */
export const quizSchema = z.object({
  questions: z
    .array(questionSchema)
    .length(QUESTIONS_PER_QUIZ)
    .refine((questions) => new Set(questions.map((q) => q.id)).size === questions.length, {
      message: 'Question ids must be unique',
    })
    .refine((questions) => new Set(questions.map((q) => q.question)).size === questions.length, {
      message: 'Questions must not repeat',
    }),
});
