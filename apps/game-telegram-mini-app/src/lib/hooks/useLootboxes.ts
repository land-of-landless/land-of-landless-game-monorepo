/**
 * game-telegram-mini-app / src/lib/hooks/useLootboxes.ts
 *
 * Fetches the player's lootbox inventory and exposes open / claim actions.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  fetchMyLootboxes,
  openLootbox,
  claimDailyLootbox,
  type Lootbox,
  type LootboxReward,
  type PaginatedLootboxes,
} from '@/lib/api/lootboxes';

interface UseLootboxesResult {
  data: PaginatedLootboxes | null;
  isLoading: boolean;
  error: Error | null;
  lastReward: LootboxReward | null;
  refetch: () => void;
  open: (lootboxId: string) => Promise<LootboxReward | null>;
  claimDaily: () => Promise<Lootbox | null>;
}

export function useLootboxes(initDataRaw: string | null): UseLootboxesResult {
  const [data, setData] = useState<PaginatedLootboxes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastReward, setLastReward] = useState<LootboxReward | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!initDataRaw) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchMyLootboxes(initDataRaw)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err: Error) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [initDataRaw, tick]);

  const open = useCallback(
    async (lootboxId: string): Promise<LootboxReward | null> => {
      if (!initDataRaw) return null;
      try {
        const reward = await openLootbox(initDataRaw, lootboxId);
        setLastReward(reward);
        setTick((t) => t + 1); // refetch inventory after opening
        return reward;
      } catch (err) {
        setError(err as Error);
        return null;
      }
    },
    [initDataRaw],
  );

  const claimDaily = useCallback(async (): Promise<Lootbox | null> => {
    if (!initDataRaw) return null;
    try {
      const box = await claimDailyLootbox(initDataRaw);
      setTick((t) => t + 1); // refetch to show new box
      return box;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }, [initDataRaw]);

  return {
    data,
    isLoading,
    error,
    lastReward,
    refetch: () => setTick((t) => t + 1),
    open,
    claimDaily,
  };
}
