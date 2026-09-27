// Server-only: how each difficulty level should shape the generated questions.
// Sent to OpenAI but never to the player, so do not import this file from
// screens or components.
import type { DifficultyId } from '@/data/difficulties';

/** Guidance for factual trivia: every category except logic puzzles, and free-text topics. */
export const triviaDifficultyGuidance = {
  easy: [
    'Easy: common, accessible knowledge that most adults know or would recognize.',
    'Ask about familiar facts in a straightforward way and avoid obscure details.',
    'Suitable for casual players; someone with basic knowledge should be able to rule out the wrong answers.',
  ].join(' '),
  medium: [
    'Medium: moderately challenging questions that require solid knowledge of the topic, the level of a regular trivia fan.',
    'Avoid trivial questions almost everyone knows, and avoid obscure or unreliable facts.',
  ].join(' '),
} satisfies Record<DifficultyId, string>;

/** Guidance for logic puzzles, where difficulty comes from the reasoning, not from knowledge. */
export const logicPuzzleDifficultyGuidance = {
  easy: 'Easy: simple patterns and direct, one-step deduction that most players solve quickly.',
  medium: 'Medium: puzzles that need multi-step reasoning, with two or three steps to reach the answer.',
} satisfies Record<DifficultyId, string>;

/** The difficulty guidance for a category, or for a free-text topic when `categoryId` is omitted. */
export function difficultyGuidanceFor(difficulty: DifficultyId, categoryId?: string): string {
  const guidance = categoryId === 'logic-puzzles' ? logicPuzzleDifficultyGuidance : triviaDifficultyGuidance;
  return guidance[difficulty];
}
