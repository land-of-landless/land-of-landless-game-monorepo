import { LAUNCHABLE_ITEMS, LaunchableItem } from "@/constants/launchSite";
import { MiniGamesLootBox } from "@/constants/miniGames";

export type LootBoxesOpenedByType = Record<MiniGamesLootBox, number>;

export type LaunchesByItem = Record<LaunchableItem, number>;

export const EMPTY_LOOT_BOXES_OPENED_BY_TYPE: LootBoxesOpenedByType = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    custom: 0,
};

export const EMPTY_LAUNCHES_BY_ITEM: LaunchesByItem = Object.fromEntries(
    LAUNCHABLE_ITEMS.map((item) => [item, 0]),
) as LaunchesByItem;
