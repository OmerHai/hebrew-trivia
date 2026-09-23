export type Question = {
  id: string;
  question: string;
  answers: [string, string, string, string];
  /** Index into `answers` of the single correct answer. */
  correctAnswerIndex: 0 | 1 | 2 | 3;
  /** Short explanation shown after the player answers. */
  explanation: string;
};
