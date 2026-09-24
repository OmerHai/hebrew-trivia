/**
 * Normalizes free text (e.g. a question) for duplicate checks:
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

/**
 * Whether the question gives its answer away by containing it: the whole
 * normalized answer appears in the question as whole words. Answers without
 * letters (numbers, e.g. in puzzles) and one- or two-letter answers are never
 * treated as leaked, since they legitimately appear in questions.
 */
export function revealsAnswer(question: string, answer: string): boolean {
  const normalizedAnswer = normalizeText(answer);
  if (normalizedAnswer.replace(/[^\p{L}]/gu, '').length < 3) return false;
  return ` ${normalizeText(question)} `.includes(` ${normalizedAnswer} `);
}
