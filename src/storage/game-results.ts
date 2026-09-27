import AsyncStorage from '@react-native-async-storage/async-storage';

// Separate from the played-question history: that one decides which questions
// to avoid, this one is the player's record of finished games.
const STORAGE_KEY = 'game-results/v1';

/**
 * A game the player finished, all questions answered. Later additions (a
 * daily-challenge mode, per-question timing, …) become new optional fields, so
 * older records stay valid.
 */
export type CompletedGame = {
  /** Unique per game, so recording the same game again is a no-op. */
  id: string;
  categoryId: string;
  difficulty: string;
  /** Correct answers. */
  score: number;
  /** Questions in the game. */
  total: number;
  /** ISO 8601 completion time. */
  completedAt: string;
};

/**
 * The stored document. An object rather than a bare list, so data such as
 * streaks or achievements can sit beside `games` later.
 */
type StoredResults = {
  version: 1;
  games: CompletedGame[];
};

/** A fresh id for a game about to be played. */
export function createGameId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isCompletedGame(value: unknown): value is CompletedGame {
  if (typeof value !== 'object' || value === null) return false;
  const game = value as CompletedGame;
  return (
    typeof game.id === 'string' &&
    game.id.length > 0 &&
    typeof game.categoryId === 'string' &&
    typeof game.difficulty === 'string' &&
    Number.isInteger(game.total) &&
    game.total > 0 &&
    Number.isInteger(game.score) &&
    game.score >= 0 &&
    game.score <= game.total &&
    typeof game.completedAt === 'string' &&
    !Number.isNaN(Date.parse(game.completedAt))
  );
}

/** Reads the stored games, keeping every valid record and dropping anything malformed. */
async function readGames(): Promise<CompletedGame[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : null;
    const games = (parsed as Partial<StoredResults> | null)?.games;
    return Array.isArray(games) ? games.filter(isCompletedGame) : [];
  } catch {
    // Unreadable data only means no statistics yet; never crash over it.
    return [];
  }
}

// Writes are chained so two quick recordings can't overwrite each other.
let pendingWrite: Promise<void> = Promise.resolve();

/** Every completed game, oldest first. */
export async function getCompletedGames(): Promise<CompletedGame[]> {
  await pendingWrite;
  return readGames();
}

/** Records a completed game. Recording a game whose id is already stored does nothing. */
export function recordCompletedGame(game: CompletedGame): Promise<void> {
  pendingWrite = pendingWrite.then(async () => {
    const games = await readGames();
    if (games.some((stored) => stored.id === game.id)) return;
    const next: StoredResults = { version: 1, games: [...games, game] };
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Not being able to save statistics must not interrupt the game.
    }
  });
  return pendingWrite;
}
