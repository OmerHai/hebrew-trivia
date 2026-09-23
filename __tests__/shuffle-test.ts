import { shuffle } from '@/utils/shuffle';

describe('shuffle', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns the same items without mutating the input', () => {
    const items = [1, 2, 3, 4, 5];

    const result = shuffle(items);

    expect(items).toEqual([1, 2, 3, 4, 5]);
    expect(result).not.toBe(items);
    expect([...result].sort()).toEqual(items);
  });

  test('reorders items using Math.random', () => {
    // Always picking j = 0 rotates the array.
    jest.spyOn(Math, 'random').mockReturnValue(0);

    expect(shuffle(['a', 'b', 'c'])).toEqual(['b', 'c', 'a']);
  });
});
