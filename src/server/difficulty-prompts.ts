// Server-only: how each difficulty level should shape the generated questions.
// Sent to OpenAI but never to the player, so do not import this file from
// screens or components.
import type { ReasoningEffort } from 'openai/resources/shared';

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
    'Avoid both trivial questions almost everyone knows and highly obscure facts.',
  ].join(' '),
  hard: [
    'Hard: challenging but fair questions for enthusiasts, using less obvious facts, deeper knowledge and closer wrong answers.',
    'Go clearly beyond what a regular trivia fan knows: skip the facts a medium question would ask about.',
    'Every question must still have exactly one clearly correct, verifiable answer.',
    'Never rely on ambiguous trivia, and never make a question difficult through vague or convoluted wording or through obscure, unverifiable facts.',
    'Harder facts are easier to get wrong: before writing a question, check that its premise is true, and avoid superlatives and counts that are disputed, tied or depend on the source.',
  ].join(' '),
} satisfies Record<DifficultyId, string>;

/** Guidance for logic puzzles, where difficulty comes from the reasoning, not from knowledge. */
export const logicPuzzleDifficultyGuidance = {
  easy: 'Easy: simple patterns and direct, one-step deduction that most players solve quickly.',
  medium: 'Medium: puzzles that need multi-step reasoning, with two or three steps to reach the answer.',
  hard: [
    'Hard: more challenging reasoning that combines several steps or constraints,',
    'but still fully solvable from the information in the question alone, with exactly one correct answer.',
  ].join(' '),
} satisfies Record<DifficultyId, string>;

/**
 * The least reasoning a level gets, whatever its category's setting. Hard
 * questions ask about less familiar facts, and without reasoning the model
 * wrote false or disputed premises that validation cannot catch.
 */
export const difficultyMinimumReasoningEfforts: Partial<Record<DifficultyId, ReasoningEffort>> = {
  hard: 'low',
};

/** The difficulty guidance for a category, or for a free-text topic when `categoryId` is omitted. */
export function difficultyGuidanceFor(difficulty: DifficultyId, categoryId?: string): string {
  const guidance = categoryId === 'logic-puzzles' ? logicPuzzleDifficultyGuidance : triviaDifficultyGuidance;
  return guidance[difficulty];
}
