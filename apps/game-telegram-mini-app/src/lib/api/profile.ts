/**
 * game-telegram-mini-app / src/lib/api/profile.ts
 *
 * All profile-related API calls against the game-server.
 * Endpoints will be filled in once the game-server routes are finalised.
 */

import { apiClient } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Mirrors the Profile shape returned by the game-server. */
export interface GameProfile {
  id: string;
  telegramId: number;
  username: string | null;
  displayName: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  currency: {
    coins: number;
    gems: number;
  };
  avatarUrl: string | null;
  joinedAt: string; // ISO-8601
}

export interface UpdateProfilePayload {
  displayName?: string;
  avatarUrl?: string;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/**
 * Fetch the authenticated user's profile.
 * Requires `initDataRaw` from Telegram SDK.
 */
export async function fetchMyProfile(initDataRaw: string): Promise<GameProfile> {
  return apiClient.get<GameProfile>('/profile/me', { initDataRaw });
}

/**
 * Update mutable profile fields (display name, avatar).
 */
export async function updateMyProfile(
  initDataRaw: string,
  payload: UpdateProfilePayload,
): Promise<GameProfile> {
  return apiClient.patch<GameProfile>('/profile/me', payload, { initDataRaw });
}

/**
 * Fetch a public profile by Telegram user ID.
 * No auth required — read-only public data.
 */
export async function fetchPublicProfile(telegramId: number): Promise<GameProfile> {
  return apiClient.get<GameProfile>(`/profile/${telegramId}`);
}
