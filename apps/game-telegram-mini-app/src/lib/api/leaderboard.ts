/**
 * game-telegram-mini-app / src/lib/api/leaderboard.ts
 *
 * Leaderboard-related API calls against the game-server.
 */

import { apiClient } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LeaderboardEntry {
  rank: number;
  telegramId: number;
  displayName: string;
  username: string | null;
  level: number;
  xp: number;
  avatarUrl: string | null;
}

export interface Leaderboard {
  entries: LeaderboardEntry[];
  updatedAt: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/**
 * Fetch the global XP leaderboard (top players).
 * Auth is optional — pass `initDataRaw` to let the server highlight
 * the caller's own rank even if they fall outside the top results.
 */
export async function fetchLeaderboard(
  initDataRaw?: string | null,
  limit = 20,
): Promise<Leaderboard> {
  return apiClient.get<Leaderboard>(`/leaderboard?limit=${limit}`, {
    initDataRaw: initDataRaw ?? undefined,
  });
}
