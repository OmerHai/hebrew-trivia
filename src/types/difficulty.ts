/** A quiz difficulty level, as shown to the player. */
export type Difficulty = {
  /** Stable English id, used in routes, API requests and the on-device history. */
  id: string;
  /** Hebrew display name. */
  name: string;
  /** Short Hebrew line under the name on the difficulty screen. */
  description: string;
  /** 1–3, drawn as a small meter next to the name. */
  level: number;
};
