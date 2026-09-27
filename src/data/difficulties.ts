import type { Difficulty } from '@/types/difficulty';

// Player-facing fields only, shared by the app and the API route. The
// generation guidance for each level lives in `src/server/difficulty-prompts.ts`.
export const difficulties = [
  { id: 'easy', name: 'קל', description: 'חימום נעים לכל אחד', level: 1 },
  { id: 'medium', name: 'בינוני', description: 'למי שמכיר את התחום', level: 2 },
  { id: 'hard', name: 'קשה', description: 'אתגר רציני למומחים', level: 3 },
] as const satisfies readonly Difficulty[];

export type DifficultyId = (typeof difficulties)[number]['id'];

export function findDifficulty(id: unknown) {
  return difficulties.find((difficulty) => difficulty.id === id);
}
