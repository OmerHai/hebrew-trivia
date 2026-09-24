import { decodeTrack, encodeTrack } from '@/utils/answer-track';

describe('answer track', () => {
  test('round-trips a game’s outcomes', () => {
    const results = [true, false, true, true, false, false, true, true, true, false];

    expect(encodeTrack(results)).toBe('1011001110');
    expect(decodeTrack(encodeTrack(results), 10)).toEqual(results);
  });

  test.each([undefined, '', '10a1', '2', '10101010101', ['1', '0']])('rejects %p', (value) => {
    expect(decodeTrack(value, 10)).toBeNull();
  });
});
