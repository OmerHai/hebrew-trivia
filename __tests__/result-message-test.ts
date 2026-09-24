import { resultMessage } from '@/utils/result-message';

describe('resultMessage', () => {
  test.each([
    [10, 'ציון מושלם!'],
    [9, 'מצוין!'],
    [8, 'מצוין!'],
    [7, 'יפה מאוד'],
    [6, 'יפה מאוד'],
    [5, 'לא רע'],
    [4, 'לא רע'],
    [3, 'נושא לא פשוט'],
    [0, 'נושא לא פשוט'],
  ])('%i out of 10 → %s', (score, title) => {
    expect(resultMessage(score, 10).title).toBe(title);
  });

  test('every message is Hebrew and never addresses a single gender', () => {
    for (let score = 0; score <= 10; score++) {
      const { title, subtitle } = resultMessage(score, 10);
      for (const text of [title, subtitle]) {
        expect(text).toMatch(/[א-ת]/);
        // Hebrew letters aren't `\w`, so whole words are matched by the spaces and punctuation around them.
        expect(text).not.toMatch(/(^|\s)(אתה|ידעת|תדע|תנסה|נסה)(?=[\s.!?]|$)/);
      }
    }
  });
});
