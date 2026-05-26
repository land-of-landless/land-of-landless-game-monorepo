import {
    LaunchesByItem,
    LootBoxesOpenedByType,
} from "@/constants/stats.js";
import { Schema, Entity } from "redis-om";

export type { LaunchesByItem, LootBoxesOpenedByType };

/**
 * Lifetime counters for a user (loot boxes opened, launch site activity, etc.).
 * Updated by gameplay services; not used for live game state.
 */
export interface Stats extends Entity {
    userId: string;

    /** Total loot boxes opened (all types). */
    loot_boxes_opened_total: number;

    /** Loot boxes opened, broken down by rarity/type. */
    loot_boxes_opened_by_type: LootBoxesOpenedByType;

    /** Total successful launch-site launches (all item types). */
    launches_total: number;

    /** Launches per launch-site item type. */
    launches_by_item: LaunchesByItem;
}

export const statsSchema = new Schema<Stats>("stats", {
    userId: {
        type: "string",
        indexed: true,
    },
});

export default statsSchema;
