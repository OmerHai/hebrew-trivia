import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getCompletedGames } from '@/storage/game-results';
import { computePlayerStats, type PlayerStats } from '@/utils/player-stats';

type PlayerStatsState = { status: 'loading' } | { status: 'ready'; stats: PlayerStats | null };

/**
 * The player's statistics from the games stored on the device. Reloaded each
 * time the screen comes into focus, e.g. after playing a game from the empty state.
 */
export function usePlayerStats(): PlayerStatsState {
  const [state, setState] = useState<PlayerStatsState>({ status: 'loading' });

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getCompletedGames().then((games) => {
        if (active) setState({ status: 'ready', stats: computePlayerStats(games) });
      });
      return () => {
        active = false;
      };
    }, []),
  );

  return state;
}
