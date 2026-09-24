const RLM = '‏';

// First character with a strong direction: a Hebrew letter or a Latin letter.
const FIRST_STRONG = /[A-Za-zÀ-ɏ֐-׿]/;

/**
 * Keeps generated text right-to-left when it happens to start with Latin
 * letters (e.g. "K2 (8,611 מ׳)"). Otherwise the whole paragraph would be laid
 * out left-to-right, aligned left, with its punctuation flipped. Adds an
 * invisible right-to-left mark only when needed; Hebrew-first text is unchanged.
 */
export function rtl(text: string): string {
  const first = text.match(FIRST_STRONG)?.[0];
  return first && !/[֐-׿]/.test(first) ? RLM + text : text;
}
