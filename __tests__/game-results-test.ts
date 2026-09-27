import AsyncStorage from '@react-native-async-storage/async-storage';

import { type CompletedGame, createGameId, getCompletedGames, recordCompletedGame } from '@/storage/game-results';
import { addPlayedQuestions } from '@/storage/question-history';

const STORAGE_KEY = 'game-results/v1';

function game(overrides: Partial<CompletedGame> = {}): CompletedGame {
  return {
    id: 'game-1',
    categoryId: 'geography',
    difficulty: 'easy',
    score: 7,
    total: 10,
    completedAt: '2026-09-27T10:00:00.000Z',
    ...overrides,
  };
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('completed-game storage', () => {
  test('a completed game is persisted in a versioned document', async () => {
    await recordCompletedGame(game());

    expect(JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!)).toEqual({ version: 1, games: [game()] });
    expect(await getCompletedGames()).toEqual([game()]);
  });

  test('stored games load back, e.g. after an app restart', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, games: [game({ id: 'earlier' })] }));

    expect(await getCompletedGames()).toEqual([game({ id: 'earlier' })]);
  });

  test('the same game cannot be recorded twice', async () => {
    await recordCompletedGame(game());
    await recordCompletedGame(game({ score: 3 }));

    expect(await getCompletedGames()).toEqual([game()]);
  });

  test('recording the same game twice at once still stores it once', async () => {
    await Promise.all([recordCompletedGame(game()), recordCompletedGame(game())]);

    expect(await getCompletedGames()).toHaveLength(1);
  });

  test('different games are all kept, oldest first, even when recorded at once', async () => {
    await Promise.all([recordCompletedGame(game({ id: 'a' })), recordCompletedGame(game({ id: 'b' }))]);

    expect((await getCompletedGames()).map((stored) => stored.id)).toEqual(['a', 'b']);
  });

  test('every game gets its own id', () => {
    const ids = Array.from({ length: 50 }, createGameId);

    expect(new Set(ids).size).toBe(50);
  });

  test('is kept apart from the played-question history', async () => {
    await addPlayedQuestions('category:geography:easy', ['מהי בירת צרפת?']);
    await recordCompletedGame(game());

    expect(await getCompletedGames()).toEqual([game()]);
    expect(JSON.parse((await AsyncStorage.getItem('played-questions/v1'))!)).toEqual([
      { scope: 'category:geography:easy', question: 'מהי בירת צרפת?' },
    ]);
  });

  describe('malformed data', () => {
    test.each([
      ['not JSON', '{not json'],
      ['a number', '42'],
      ['null', 'null'],
      ['a document without games', JSON.stringify({ version: 1 })],
      ['games that are not a list', JSON.stringify({ version: 1, games: 'many' })],
    ])('%s reads as no games instead of crashing', async (_case, stored) => {
      await AsyncStorage.setItem(STORAGE_KEY, stored);

      await expect(getCompletedGames()).resolves.toEqual([]);
    });

    test('invalid records are dropped and the valid ones kept', async () => {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          games: [
            game({ id: 'valid-1' }),
            null,
            'game',
            { ...game(), id: undefined },
            game({ id: 'no-category', categoryId: 5 as unknown as string }),
            game({ id: 'score-too-high', score: 11 }),
            game({ id: 'negative', score: -1 }),
            game({ id: 'fraction', score: 6.5 }),
            game({ id: 'no-questions', total: 0 }),
            game({ id: 'bad-date', completedAt: 'yesterday' }),
            game({ id: 'valid-2', difficulty: 'medium' }),
          ],
        }),
      );

      expect((await getCompletedGames()).map((stored) => stored.id)).toEqual(['valid-1', 'valid-2']);
    });

    test('recording after corruption keeps the valid records', async () => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, games: [game({ id: 'old' }), { broken: true }] }));

      await recordCompletedGame(game({ id: 'new' }));

      expect((await getCompletedGames()).map((stored) => stored.id)).toEqual(['old', 'new']);
    });

    test('a failing device storage does not throw', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk full'));
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('unavailable'));

      await expect(recordCompletedGame(game())).resolves.toBeUndefined();
      await expect(getCompletedGames()).resolves.toEqual([]);
    });
  });
});
