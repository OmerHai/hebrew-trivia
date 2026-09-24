import type { Category } from '@/types/category';

// Player-facing fields only. Each category's generation instructions live in
// `src/server/category-prompts.ts`, so they never reach the app. Tints are
// spread so neighbors in the two-column grid never share a color.
export const categories = [
  { id: 'general-knowledge', name: 'ידע כללי', icon: { ios: 'lightbulb.fill', android: 'lightbulb' }, tint: 'coral' },
  { id: 'geography', name: 'גאוגרפיה', icon: { ios: 'globe.europe.africa.fill', android: 'public' }, tint: 'teal' },
  { id: 'history', name: 'היסטוריה', icon: { ios: 'building.columns.fill', android: 'account_balance' }, tint: 'olive' },
  { id: 'science', name: 'מדע', icon: { ios: 'atom', android: 'science' }, tint: 'violet' },
  { id: 'nature-animals', name: 'טבע ובעלי חיים', icon: { ios: 'pawprint.fill', android: 'pets' }, tint: 'green' },
  { id: 'technology', name: 'טכנולוגיה', icon: { ios: 'cpu', android: 'memory' }, tint: 'sky' },
  { id: 'movies', name: 'קולנוע', icon: { ios: 'film', android: 'movie' }, tint: 'pink' },
  { id: 'tv-series', name: 'סדרות טלוויזיה', icon: { ios: 'tv', android: 'tv' }, tint: 'blue' },
  { id: 'music', name: 'מוזיקה', icon: { ios: 'music.note', android: 'music_note' }, tint: 'violet' },
  { id: 'sports', name: 'ספורט', icon: { ios: 'trophy.fill', android: 'emoji_events' }, tint: 'coral' },
  { id: 'football', name: 'כדורגל', icon: { ios: 'soccerball', android: 'sports_soccer' }, tint: 'green' },
  { id: 'food', name: 'אוכל', icon: { ios: 'fork.knife', android: 'restaurant' }, tint: 'olive' },
  { id: 'israel', name: 'ישראל', icon: { ios: 'flag.fill', android: 'flag' }, tint: 'blue' },
  { id: 'video-games', name: 'משחקי מחשב', icon: { ios: 'gamecontroller.fill', android: 'sports_esports' }, tint: 'pink' },
  { id: 'books', name: 'ספרים', icon: { ios: 'book.fill', android: 'menu_book' }, tint: 'teal' },
  { id: 'logic-puzzles', name: 'חידות היגיון', icon: { ios: 'puzzlepiece.fill', android: 'extension' }, tint: 'sky' },
] as const satisfies readonly Category[];

export type CategoryId = (typeof categories)[number]['id'];

export function findCategory(id: unknown) {
  return categories.find((category) => category.id === id);
}
