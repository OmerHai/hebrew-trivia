import AsyncStorage from '@react-native-async-storage/async-storage';

import { normalizeText } from '@/utils/question-text';
import type { QuizRequest } from '@/utils/quiz-schema';

const STORAGE_KEY = 'played-questions/v1';
/** How many played questions are kept on the device, across all categories and topics. */
export const MAX_HISTORY_SIZE = 100;
/** How many recent questions of the same category or topic are sent as exclusions. */
export const RELEVANT_HISTORY_SIZE = 30;

/** A played question. Only the question text is kept — no answers, scores or secrets. */
type HistoryEntry = {
  /** The category or custom topic the question was played in; see `historyScope`. */
  scope: string;
  question: string;
};

/** Identifies which history is relevant to a request: per category, or per normalized custom topic. */
export function historyScope(request: QuizRequest): string {
  return request.categoryId !== undefined ? `category:${request.categoryId}` : `topic:${normalizeText(request.topic)}`;
}

async function readHistory(): Promise<HistoryEntry[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter(isHistoryEntry) : [];
  } catch {
    // Missing or corrupt history only means questions may repeat; never block a game on it.
    return [];
  }
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as HistoryEntry).scope === 'string' &&
    typeof (value as HistoryEntry).question === 'string'
  );
}

/** The most recent questions played in `scope`, newest first. */
export async function getRecentQuestions(scope: string, limit = RELEVANT_HISTORY_SIZE): Promise<string[]> {
  await pendingWrite;
  const history = await readHistory();
  return history
    .filter((entry) => entry.scope === scope)
    .slice(-limit)
    .reverse()
    .map((entry) => entry.question);
}

// Writes are chained so two quick additions can't overwrite each other.
let pendingWrite: Promise<void> = Promise.resolve();

/** Records questions that became part of a playable quiz, keeping only the latest `MAX_HISTORY_SIZE`. */
export function addPlayedQuestions(scope: string, questions: readonly string[]): Promise<void> {
  pendingWrite = pendingWrite.then(async () => {
    const added = new Set(questions.map(normalizeText));
    const history = await readHistory();
    const kept = history.filter((entry) => entry.scope !== scope || !added.has(normalizeText(entry.question)));
    const next = [...kept, ...questions.map((question) => ({ scope, question }))].slice(-MAX_HISTORY_SIZE);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Not being able to save history must not interrupt the game.
    }
  });
  return pendingWrite;
}
