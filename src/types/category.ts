/** A predefined trivia category, as shown to the player. */
export type Category = {
  /** Stable English id, used in routes, API requests and the on-device history. */
  id: string;
  /** Hebrew display name. */
  name: string;
  emoji: string;
};
