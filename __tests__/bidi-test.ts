import { rtl } from '@/utils/bidi';

describe('rtl', () => {
  test('leaves Hebrew-first text untouched', () => {
    expect(rtl('קנברה')).toBe('קנברה');
    expect(rtl('1901 היא שנת ההקמה')).toBe('1901 היא שנת ההקמה');
  });

  test('marks text that starts with Latin letters as right-to-left', () => {
    expect(rtl('K2 (8,611 מ׳)')).toBe('‏K2 (8,611 מ׳)');
    expect(rtl('"Titanic" זכה ב־11 פרסים')).toBe('‏"Titanic" זכה ב־11 פרסים');
  });

  test('leaves text without letters untouched', () => {
    expect(rtl('1,000')).toBe('1,000');
  });

  test('never reverses the characters themselves', () => {
    const text = 'Queen ו־Beatles';
    expect(rtl(text).replace('‏', '')).toBe(text);
  });
});
