import { normalizeText } from '@/utils/question-text';

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
