import { normalizeText, revealsAnswer } from '@/utils/question-text';

describe('normalizeText', () => {
  test.each([
    ['surrounding and repeated whitespace', '  מהי   בירת צרפת  ', 'מהי בירת צרפת'],
    ['punctuation and quotes', 'מי כתב את "התקווה"?', 'מי כתב את התקווה'],
    ['Hebrew vowel marks', 'מָה שְׁמָהּ?', 'מה שמה'],
    ['a maqaf', 'תל־אביב', 'תל אביב'],
    ['Latin letter case', 'Who founded Apple?', 'who founded apple'],
  ])('ignores %s', (_case, text, normalized) => {
    expect(normalizeText(text)).toBe(normalized);
  });

  test('keeps different questions apart', () => {
    expect(normalizeText('מהי בירת צרפת?')).not.toBe(normalizeText('מהי בירת ספרד?'));
  });
});

describe('revealsAnswer', () => {
  test.each([
    ['the exact answer', 'איזה קומיקאי יצר את הדמות של שייקה אופיר?', 'שייקה אופיר'],
    ['the answer in quotes', 'באיזו סדרת סרטים מופיע „אינדיאנה ג׳ונס”?', '«אינדיאנה ג׳ונס»'],
    ['the answer with vowel marks', 'איזו עיר היא בירת ישראל לפי חוק יסוד: ירושלים?', 'יְרוּשָׁלַיִם'],
    ['a Latin answer in another case', 'In which game series does Tomb Raider’s Lara Croft star?', 'tomb raider'],
  ])('detects a question that contains %s', (_case, question, answer) => {
    expect(revealsAnswer(question, answer)).toBe(true);
  });

  test.each([
    ['ordinary shared words', 'מי כתב את הספר „מישהו לרוץ איתו”?', 'דויד גרוסמן'],
    ['only part of the answer', 'מהי בירת מקסיקו?', 'מקסיקו סיטי'],
    ['a similar but different word', 'מהו הים המלוח ביותר בעולם?', 'ים המלח'],
    ['the answer inside a longer word', 'איזו עיר נקראת לפעמים ״בירושלים של הצפון״?', 'ירושלים'],
    ['a number, as in a puzzle', 'היו 10 נרות דולקים וכיבו 2. כמה נרות נשארו בסוף?', '2'],
    ['a two-letter answer', 'באיזה ים נמצא האי כרתים?', 'ים'],
  ])('allows a question that shares %s', (_case, question, answer) => {
    expect(revealsAnswer(question, answer)).toBe(false);
  });
});
