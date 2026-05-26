/**
 * game-telegram-mini-app / src/lib/api/lootboxes.ts
 *
 * All lootbox-related API calls against the game-server.
 */

import { apiClient } from './client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LootboxRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Lootbox {
  id: string;
  name: string;
  rarity: LootboxRarity;
  imageUrl: string | null;
  /** ISO-8601 timestamp — when it becomes available to open */
  availableAt: string | null;
  isOpenable: boolean;
  rewardPreview: string;
}

export interface LootboxReward {
  lootboxId: string;
  rewards: Array<{
    type: 'coins' | 'gems' | 'item';
    amount?: number;
    itemId?: string;
    itemName?: string;
    itemRarity?: LootboxRarity;
  }>;
  openedAt: string;
}

export interface PaginatedLootboxes {
  items: Lootbox[];
  total: number;
  page: number;
  pageSize: number;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/**
 * Fetch the player's lootbox inventory, optionally paginated.
 */
export async function fetchMyLootboxes(
  initDataRaw: string,
  page = 1,
  pageSize = 20,
): Promise<PaginatedLootboxes> {
  return apiClient.get<PaginatedLootboxes>(
    `/lootboxes/me?page=${page}&pageSize=${pageSize}`,
    { initDataRaw },
  );
}

/**
 * Open (consume) a lootbox by ID.
 * Returns the list of rewards granted.
 */
export async function openLootbox(
  initDataRaw: string,
  lootboxId: string,
): Promise<LootboxReward> {
  return apiClient.post<LootboxReward>(
    `/lootboxes/${lootboxId}/open`,
    undefined,
    { initDataRaw },
  );
}

/**
 * Claim a free / daily lootbox grant.
 * The server decides which lootbox type is granted.
 */
export async function claimDailyLootbox(initDataRaw: string): Promise<Lootbox> {
  return apiClient.post<Lootbox>('/lootboxes/claim-daily', undefined, {
    initDataRaw,
  });
}
