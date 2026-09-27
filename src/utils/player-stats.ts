import { categories } from '@/data/categories';
import { difficulties } from '@/data/difficulties';
import type { CompletedGame } from '@/storage/game-results';
import type { Category } from '@/types/category';
import type { Difficulty } from '@/types/difficulty';
import { QUESTIONS_PER_QUIZ } from '@/utils/quiz-schema';

/** A category needs this many completed games before it can be the strongest. */
export const MIN_GAMES_FOR_STRONGEST = 2;

type Summary = {
  games: number;
  /** Mean score, out of `QUESTIONS_PER_QUIZ`. */
  average: number;
  /** Highest score, out of `QUESTIONS_PER_QUIZ`. */
  best: number;
};

export type CategoryStats = Summary & { category: Category };
export type DifficultyStats = Summary & { difficulty: Difficulty };

export type PlayerStats = Summary & {
  totalCorrect: number;
  /** Only the levels the player has completed a game at, easiest first. */
  byDifficulty: DifficultyStats[];
  /** Only the categories the player has completed a game in, most played first. */
  byCategory: CategoryStats[];
  /** The best-scoring category with enough games, or `null` while none qualifies. */
  strongestCategory: CategoryStats | null;
};

/** A game's score scaled to `QUESTIONS_PER_QUIZ`, so games of any length compare. */
function scaledScore(game: CompletedGame): number {
  return (game.score / game.total) * QUESTIONS_PER_QUIZ;
}

function summarize(games: readonly CompletedGame[]): Summary {
  const scores = games.map(scaledScore);
  return {
    games: games.length,
    average: scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0,
    best: scores.length ? Math.max(...scores) : 0,
  };
}

/** Aggregates completed games into the statistics the player sees; `null` before the first game. */
export function computePlayerStats(games: readonly CompletedGame[]): PlayerStats | null {
  if (games.length === 0) return null;

  const byDifficulty = difficulties
    .map((difficulty) => ({ difficulty, ...summarize(games.filter((game) => game.difficulty === difficulty.id)) }))
    .filter((stats) => stats.games > 0);

  // Ties keep the order of the category menu, so the list is stable.
  const byCategory = categories
    .map((category) => ({ category, ...summarize(games.filter((game) => game.categoryId === category.id)) }))
    .filter((stats) => stats.games > 0)
    .sort((a, b) => b.games - a.games);

  const strongestCategory =
    byCategory
      .filter((stats) => stats.games >= MIN_GAMES_FOR_STRONGEST)
      .reduce<CategoryStats | null>((best, stats) => (!best || stats.average > best.average ? stats : best), null);

  return {
    ...summarize(games),
    totalCorrect: games.reduce((sum, game) => sum + game.score, 0),
    byDifficulty,
    byCategory,
    strongestCategory,
  };
}

/** A score for display: at most one decimal, and none when it's whole ("7.2", "8"). */
export function formatScore(score: number): string {
  return String(Math.round(score * 10) / 10);
}

/** "משחק אחד", "3 משחקים". */
export function gamesLabel(count: number): string {
  return count === 1 ? 'משחק אחד' : `${count} משחקים`;
}
