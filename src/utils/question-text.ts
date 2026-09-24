/**
 * Normalizes free text (a question or a custom topic) for duplicate checks:
 * ignores case, Hebrew vowel marks, punctuation, symbols and extra whitespace.
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[֑-ׇ]/g, (mark) => (mark === '־' ? ' ' : '')) // niqqud and cantillation; maqaf is a hyphen
    .replace(/[\p{P}\p{S}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
