/**
 * game-telegram-mini-app / src/lib/hooks/useProfile.ts
 *
 * Fetches and caches the authenticated player's profile.
 */

import { useEffect, useState } from 'react';
import { fetchMyProfile, type GameProfile } from '@/lib/api/profile';

interface UseProfileResult {
  profile: GameProfile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useProfile(initDataRaw: string | null): UseProfileResult {
  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!initDataRaw) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchMyProfile(initDataRaw)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initDataRaw, tick]);

  return {
    profile,
    isLoading,
    error,
    refetch: () => setTick((t) => t + 1),
  };
}
