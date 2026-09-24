/**
 * The per-question outcomes of a game as a compact route param: one character
 * per answered question, `1` for correct and `0` for wrong.
 */
export function encodeTrack(results: readonly boolean[]): string {
  return results.map((correct) => (correct ? '1' : '0')).join('');
}

/** Reads a track param back; anything that isn't a valid track yields `null`. */
export function decodeTrack(value: unknown, maxLength: number): boolean[] | null {
  if (typeof value !== 'string' || value.length === 0 || value.length > maxLength || !/^[01]+$/.test(value)) {
    return null;
  }
  return [...value].map((char) => char === '1');
}
