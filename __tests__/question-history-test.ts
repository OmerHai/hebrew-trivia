import AsyncStorage from '@react-native-async-storage/async-storage';

import { categories } from '@/data/categories';
import {
  addPlayedQuestions,
  getRecentQuestions,
  historyScope,
  MAX_HISTORY_SIZE,
  RELEVANT_HISTORY_SIZE,
} from '@/storage/question-history';

function questions(prefix: string, count: number) {
  return Array.from({ length: count }, (_, index) => `${prefix} ${index + 1}?`);
}

describe('question history', () => {
  test('played questions are persisted in device storage', async () => {
    await addPlayedQuestions('category:geography', ['מהי בירת צרפת?']);

    const stored = JSON.parse((await AsyncStorage.getItem('played-questions/v1'))!);
    expect(stored).toEqual([{ scope: 'category:geography', question: 'מהי בירת צרפת?' }]);
    expect(await getRecentQuestions('category:geography')).toEqual(['מהי בירת צרפת?']);
  });

  test('history loads back from storage, e.g. after an app restart', async () => {
    await AsyncStorage.setItem(
      'played-questions/v1',
      JSON.stringify([{ scope: 'category:geography', question: 'שאלה משמירה קודמת?' }]),
    );

    expect(await getRecentQuestions('category:geography')).toEqual(['שאלה משמירה קודמת?']);
  });

  test('history keeps only the most recent 100 questions', async () => {
    await addPlayedQuestions('category:geography', questions('ישנה', 60));
    await addPlayedQuestions('category:technology', questions('חדשה', 60));

    const stored: unknown[] = JSON.parse((await AsyncStorage.getItem('played-questions/v1'))!);
    expect(stored).toHaveLength(MAX_HISTORY_SIZE);
    expect(await getRecentQuestions('category:geography', 100)).toHaveLength(40);
    expect(await getRecentQuestions('category:geography', 100)).not.toContain('ישנה 1?');
    expect(await getRecentQuestions('category:technology', 100)).toHaveLength(60);
  });

  test('only a bounded subset of the latest relevant questions is returned, newest first', async () => {
    await addPlayedQuestions('category:geography', questions('שאלה', 40));

    const recent = await getRecentQuestions('category:geography');
    expect(recent).toHaveLength(RELEVANT_HISTORY_SIZE);
    expect(recent[0]).toBe('שאלה 40?');
    expect(recent).not.toContain('שאלה 10?');
  });

  test('category histories are kept separate', async () => {
    await addPlayedQuestions(historyScope('geography'), ['מהי בירת צרפת?']);
    await addPlayedQuestions(historyScope('technology'), ['מי ייסד את מיקרוסופט?']);

    expect(await getRecentQuestions(historyScope('geography'))).toEqual(['מהי בירת צרפת?']);
    expect(await getRecentQuestions(historyScope('technology'))).toEqual(['מי ייסד את מיקרוסופט?']);
  });

  test('every category has its own history scope, keyed by its stable id', () => {
    const scopes = categories.map((category) => historyScope(category.id));

    expect(new Set(scopes).size).toBe(categories.length);
    expect(historyScope('football')).toBe('category:football');
  });

  test('neighbouring categories such as football and sports do not share history', async () => {
    await addPlayedQuestions(historyScope('football'), ['מי זכתה במונדיאל 2018?']);
    await addPlayedQuestions(historyScope('sports'), ['כמה שחקנים יש בקבוצת כדורסל על המגרש?']);

    expect(await getRecentQuestions(historyScope('football'))).toEqual(['מי זכתה במונדיאל 2018?']);
    expect(await getRecentQuestions(historyScope('sports'))).toEqual(['כמה שחקנים יש בקבוצת כדורסל על המגרש?']);
    expect(await getRecentQuestions(historyScope('logic-puzzles'))).toEqual([]);
  });

  test('a question played again moves to the front instead of being stored twice', async () => {
    await addPlayedQuestions('category:geography', ['מהי בירת צרפת?', 'מהו הנהר הארוך בעולם?']);
    await addPlayedQuestions('category:geography', ['מהי בירת צרפת']);

    expect(await getRecentQuestions('category:geography')).toEqual(['מהי בירת צרפת', 'מהו הנהר הארוך בעולם?']);
  });

  test('concurrent additions are not lost', async () => {
    await Promise.all([
      addPlayedQuestions('category:geography', ['שאלה א?']),
      addPlayedQuestions('category:geography', ['שאלה ב?']),
    ]);

    expect(await getRecentQuestions('category:geography')).toEqual(['שאלה ב?', 'שאלה א?']);
  });

  test('corrupt stored history is ignored', async () => {
    await AsyncStorage.setItem('played-questions/v1', '{not json');

    expect(await getRecentQuestions('category:geography')).toEqual([]);
  });
});
