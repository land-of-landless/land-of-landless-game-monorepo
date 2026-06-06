/**
 * game-telegram-mini-app / src/lib/hooks/useLeaderboard.ts
 *
 * Fetches the global leaderboard and falls back to mock data when the
 * game-server is unreachable (e.g. local dev / offline).
 */

import { useEffect, useState } from 'react';
import { fetchLeaderboard, type Leaderboard } from '@/lib/api/leaderboard';

const MOCK_LEADERBOARD: Leaderboard = {
  entries: [
    { rank: 1,  telegramId: 1001, displayName: 'IronVanguard',   username: 'ironvanguard',  level: 42, xp: 98_400, avatarUrl: null },
    { rank: 2,  telegramId: 1002, displayName: 'StarlightMage',  username: 'starlightmage', level: 39, xp: 87_250, avatarUrl: null },
    { rank: 3,  telegramId: 1003, displayName: 'ShadowBlade',    username: 'shadowblade',   level: 37, xp: 81_600, avatarUrl: null },
    { rank: 4,  telegramId: 1004, displayName: 'CrimsonArrow',   username: null,            level: 34, xp: 73_980, avatarUrl: null },
    { rank: 5,  telegramId: 1005, displayName: 'AncientWarden',  username: 'ancientwarden', level: 31, xp: 65_430, avatarUrl: null },
    { rank: 6,  telegramId: 1006, displayName: 'RuneSeeker',     username: 'runeseeker',    level: 28, xp: 57_100, avatarUrl: null },
    { rank: 7,  telegramId: 1007, displayName: 'VoidWalker',     username: null,            level: 26, xp: 50_820, avatarUrl: null },
    { rank: 8,  telegramId: 1008, displayName: 'GoldenHerald',   username: 'goldenherald',  level: 24, xp: 44_550, avatarUrl: null },
    { rank: 9,  telegramId: 1009, displayName: 'NightHunter',    username: 'nighthunter',   level: 22, xp: 38_760, avatarUrl: null },
    { rank: 10, telegramId: 1010, displayName: 'StoneBreaker',   username: null,            level: 20, xp: 32_500, avatarUrl: null },
  ],
  updatedAt: new Date().toISOString(),
};

interface UseLeaderboardResult {
  leaderboard: Leaderboard | null;
  isLoading: boolean;
  error: Error | null;
  isMock: boolean;
  refetch: () => void;
}

export function useLeaderboard(initDataRaw: string | null): UseLeaderboardResult {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchLeaderboard(initDataRaw)
      .then((data) => {
        if (!cancelled) {
          setLeaderboard(data);
          setIsMock(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Server unavailable — fall back to mock data for a good dev experience
          setLeaderboard(MOCK_LEADERBOARD);
          setIsMock(true);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initDataRaw, tick]);

  return {
    leaderboard,
    isLoading,
    error,
    isMock,
    refetch: () => setTick((t) => t + 1),
  };
}
