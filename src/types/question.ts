export type Question = {
  id: string;
  categoryId: string;
  question: string;
  answers: [string, string, string, string];
  /** Index into `answers` of the single correct answer. */
  correctIndex: 0 | 1 | 2 | 3;
};
