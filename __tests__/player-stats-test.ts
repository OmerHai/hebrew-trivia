import type { CompletedGame } from '@/storage/game-results';
import { computePlayerStats, formatScore, gamesLabel } from '@/utils/player-stats';

let nextId = 0;

function game(categoryId: string, difficulty: string, score: number): CompletedGame {
  nextId += 1;
  return { id: `game-${nextId}`, categoryId, difficulty, score, total: 10, completedAt: '2026-09-27T10:00:00.000Z' };
}

describe('computePlayerStats', () => {
  test('there are no statistics before the first completed game', () => {
    expect(computePlayerStats([])).toBeNull();
  });

  test('overall: total games, total correct answers, average and best score', () => {
    const stats = computePlayerStats([
      game('geography', 'easy', 6),
      game('geography', 'medium', 9),
      game('history', 'easy', 7),
      game('music', 'easy', 4),
    ])!;

    expect(stats.games).toBe(4);
    expect(stats.totalCorrect).toBe(26);
    expect(stats.average).toBe(6.5);
    expect(stats.best).toBe(9);
  });

  test('a single game is its own average and best', () => {
    const stats = computePlayerStats([game('science', 'medium', 8)])!;

    expect(stats).toMatchObject({ games: 1, totalCorrect: 8, average: 8, best: 8 });
  });

  test('easy and medium statistics are kept separate', () => {
    const stats = computePlayerStats([
      game('geography', 'easy', 10),
      game('history', 'easy', 8),
      game('geography', 'medium', 5),
    ])!;

    expect(stats.byDifficulty.map(({ difficulty, games, average }) => ({ id: difficulty.id, games, average }))).toEqual([
      { id: 'easy', games: 2, average: 9 },
      { id: 'medium', games: 1, average: 5 },
    ]);
  });

  test('a level with no completed games is left out', () => {
    const stats = computePlayerStats([game('geography', 'medium', 5), game('history', 'medium', 7)])!;

    expect(stats.byDifficulty.map((entry) => entry.difficulty.id)).toEqual(['medium']);
  });

  test('category statistics aggregate each category’s games', () => {
    const stats = computePlayerStats([
      game('geography', 'easy', 6),
      game('history', 'easy', 9),
      game('geography', 'medium', 8),
      game('geography', 'easy', 7),
    ])!;

    expect(
      stats.byCategory.map(({ category, games, average, best }) => ({ id: category.id, games, average, best })),
    ).toEqual([
      { id: 'geography', games: 3, average: 7, best: 8 },
      { id: 'history', games: 1, average: 9, best: 9 },
    ]);
    expect(stats.byCategory[0].category.name).toBe('גאוגרפיה');
  });

  test('categories are sorted by games played, ties in menu order', () => {
    const stats = computePlayerStats([
      game('music', 'easy', 5),
      game('history', 'easy', 5),
      game('logic-puzzles', 'easy', 5),
      game('logic-puzzles', 'easy', 5),
      game('geography', 'easy', 5),
    ])!;

    expect(stats.byCategory.map((entry) => entry.category.id)).toEqual(['logic-puzzles', 'geography', 'history', 'music']);
  });

  test('categories that have not been played are not included', () => {
    const stats = computePlayerStats([game('football', 'easy', 5)])!;

    expect(stats.byCategory).toHaveLength(1);
    expect(stats.byCategory[0].category.id).toBe('football');
  });

  test('games of a category or level that no longer exists count overall only', () => {
    const stats = computePlayerStats([game('geography', 'easy', 6), game('retired-topic', 'expert', 10)])!;

    expect(stats).toMatchObject({ games: 2, totalCorrect: 16, average: 8, best: 10 });
    expect(stats.byCategory.map((entry) => entry.category.id)).toEqual(['geography']);
    expect(stats.byDifficulty.map((entry) => entry.difficulty.id)).toEqual(['easy']);
  });

  describe('strongest category', () => {
    test('requires at least 2 completed games in the category', () => {
      const stats = computePlayerStats([game('geography', 'easy', 10), game('history', 'easy', 9)])!;

      expect(stats.strongestCategory).toBeNull();
    });

    test('is the qualifying category with the highest average', () => {
      const stats = computePlayerStats([
        // A perfect single game doesn't qualify.
        game('music', 'easy', 10),
        game('geography', 'easy', 6),
        game('geography', 'easy', 7),
        game('history', 'easy', 8),
        game('history', 'medium', 9),
      ])!;

      expect(stats.strongestCategory?.category.id).toBe('history');
      expect(stats.strongestCategory?.average).toBe(8.5);
    });

    test('a tie goes to the category played more', () => {
      const stats = computePlayerStats([
        game('history', 'easy', 8),
        game('history', 'easy', 8),
        game('geography', 'easy', 8),
        game('geography', 'easy', 8),
        game('geography', 'easy', 8),
      ])!;

      expect(stats.strongestCategory?.category.id).toBe('geography');
    });
  });
});

describe('formatting', () => {
  test.each([
    [7.25, '7.3'],
    [7.2, '7.2'],
    [8, '8'],
    [6.666, '6.7'],
    [10, '10'],
  ])('a score of %s shows as %s', (score, shown) => {
    expect(formatScore(score)).toBe(shown);
  });

  test('game counts read naturally in Hebrew', () => {
    expect(gamesLabel(1)).toBe('משחק אחד');
    expect(gamesLabel(2)).toBe('2 משחקים');
    expect(gamesLabel(18)).toBe('18 משחקים');
  });
});
