import type { AndroidSymbol, SFSymbol } from 'expo-symbols';

import type { CategoryTint } from '@/theme/colors';

/** A native icon: an SF Symbol on iOS, a Material Symbol on Android and web. */
export type CategoryIcon = { ios: SFSymbol; android: AndroidSymbol };

/** A predefined trivia category, as shown to the player. */
export type Category = {
  /** Stable English id, used in routes, API requests and the on-device history. */
  id: string;
  /** Hebrew display name. */
  name: string;
  icon: CategoryIcon;
  /** The category's soft color on tiles and category marks. */
  tint: CategoryTint;
};
