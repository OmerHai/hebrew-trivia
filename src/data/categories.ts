import type { Category } from '@/types/category';

// Player-facing fields only. Each category's generation instructions live in
// `src/server/category-prompts.ts`, so they never reach the app.
export const categories = [
  { id: 'general-knowledge', name: 'ידע כללי', emoji: '🧠' },
  { id: 'geography', name: 'גאוגרפיה', emoji: '🌍' },
  { id: 'history', name: 'היסטוריה', emoji: '🏛️' },
  { id: 'science', name: 'מדע', emoji: '🔬' },
  { id: 'nature-animals', name: 'טבע ובעלי חיים', emoji: '🦁' },
  { id: 'technology', name: 'טכנולוגיה', emoji: '💻' },
  { id: 'movies', name: 'קולנוע', emoji: '🎬' },
  { id: 'tv-series', name: 'סדרות טלוויזיה', emoji: '📺' },
  { id: 'music', name: 'מוזיקה', emoji: '🎵' },
  { id: 'sports', name: 'ספורט', emoji: '🏅' },
  { id: 'football', name: 'כדורגל', emoji: '⚽' },
  { id: 'food', name: 'אוכל', emoji: '🍕' },
  { id: 'israel', name: 'ישראל', emoji: '🇮🇱' },
  { id: 'israeli-culture', name: 'תרבות ישראלית', emoji: '🎭' },
  { id: 'video-games', name: 'משחקי מחשב', emoji: '🎮' },
  { id: 'books', name: 'ספרים', emoji: '📚' },
  { id: 'logic-puzzles', name: 'חידות היגיון', emoji: '🧩' },
] as const satisfies readonly Category[];

export type CategoryId = (typeof categories)[number]['id'];

export function findCategory(id: unknown) {
  return categories.find((category) => category.id === id);
}
