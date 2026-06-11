import { db } from "./connection.js";
import {
    stats,
    lootBoxesByType,
    launchesByItem,
} from "@/models/postgres/schema.ts";
import { eq } from "drizzle-orm";
import logger from "@/utils/logger.js";
import { ERRORS } from "@/common/errors/appError.js";
import {
    EMPTY_LOOT_BOXES_OPENED_BY_TYPE,
    LootBoxesOpenedByType,
    LaunchesByItem,
} from "../../constants/stats.ts";
import { MiniGamesLootBox } from "@/constants/miniGames.js";
import { LaunchableItem } from "@/constants/launchSite.js";

/**
 * Data Access Object for Stats-related operations.
 * Handles database persistence and retrieval for player stats in PostgreSQL.
 */
export default class StatsDAO {
    /**
     * Creates a new Stats profile for a user.
     * @param statsData - The initial stats data.
     * @returns The created stats data.
     */
    static async createStats(statsData: any) {
        try {
            return await db.transaction(async tx => {
                await tx.insert(stats).values({
                    user_id: statsData.userId,
                    loot_boxes_opened_total:
                        statsData.loot_boxes_opened_total ?? 0,
                    launches_total: statsData.launches_total ?? 0,
                });

                const lootBoxesOpenedByType =
                    statsData.loot_boxes_opened_by_type;
                if (lootBoxesOpenedByType) {
                    await tx.insert(lootBoxesByType).values(
                        Object.entries(lootBoxesOpenedByType).map(
                            ([boxType, count]) => ({
                                user_id: statsData.userId,
                                box_type: boxType,
                                count: count as number,
                            })
                        )
                    );
                }

                const launchesByItemData = statsData.launches_by_item;
                if (launchesByItemData) {
                    await tx.insert(launchesByItem).values(
                        Object.entries(launchesByItemData).map(
                            ([itemType, count]) => ({
                                user_id: statsData.userId,
                                item_type: itemType,
                                count: count as number,
                            })
                        )
                    );
                }

                return statsData;
            });
        } catch (error) {
            logger.error(
                `[StatsDAO.createStats] Error for userId: ${statsData.userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to create stats: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Finds a Stats profile by user ID.
     * @param userId - The ID of the user.
     * @returns The stats data if found, otherwise null.
     */
    static async findStatsByUserId(userId: string) {
        try {
            const statsProfile = await db.query.stats.findFirst({
                where: eq(stats.user_id, userId),
                with: {
                    lootBoxesByType: true,
                    launchesByItem: true,
                },
            });

            if (!statsProfile) return null;

            const loot_boxes_opened_by_type = {
                ...EMPTY_LOOT_BOXES_OPENED_BY_TYPE,
            } as LootBoxesOpenedByType;
            for (const row of statsProfile.lootBoxesByType) {
                loot_boxes_opened_by_type[row.box_type as MiniGamesLootBox] =
                    row.count;
            }

            const launches_by_item = {} as LaunchesByItem;
            for (const row of statsProfile.launchesByItem) {
                launches_by_item[row.item_type as LaunchableItem] = row.count;
            }

            return {
                userId: statsProfile.user_id,
                loot_boxes_opened_total: statsProfile.loot_boxes_opened_total,
                launches_total: statsProfile.launches_total,
                loot_boxes_opened_by_type,
                launches_by_item,
            };
        } catch (error) {
            logger.error(
                `[StatsDAO.findStatsByUserId] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to find stats: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Saves (upserts) a Stats profile.
     * @param statsProfile - The stats profile data to save.
     * @returns The saved stats data.
     */
    static async saveStatsProfile(statsProfile: any) {
        try {
            return await db.transaction(async tx => {
                await tx
                    .insert(stats)
                    .values({
                        user_id: statsProfile.userId,
                        loot_boxes_opened_total:
                            statsProfile.loot_boxes_opened_total ?? 0,
                        launches_total: statsProfile.launches_total ?? 0,
                    })
                    .onConflictDoUpdate({
                        target: stats.user_id,
                        set: {
                            loot_boxes_opened_total:
                                statsProfile.loot_boxes_opened_total ?? 0,
                            launches_total: statsProfile.launches_total ?? 0,
                        },
                    });

                await tx
                    .delete(lootBoxesByType)
                    .where(eq(lootBoxesByType.user_id, statsProfile.userId));
                const lootBoxesOpenedByType =
                    statsProfile.loot_boxes_opened_by_type;
                if (lootBoxesOpenedByType) {
                    await tx.insert(lootBoxesByType).values(
                        Object.entries(lootBoxesOpenedByType).map(
                            ([boxType, count]) => ({
                                user_id: statsProfile.userId,
                                box_type: boxType,
                                count: count as number,
                            })
                        )
                    );
                }

                await tx
                    .delete(launchesByItem)
                    .where(eq(launchesByItem.user_id, statsProfile.userId));
                const launchesByItemData = statsProfile.launches_by_item;
                if (launchesByItemData) {
                    await tx.insert(launchesByItem).values(
                        Object.entries(launchesByItemData).map(
                            ([itemType, count]) => ({
                                user_id: statsProfile.userId,
                                item_type: itemType,
                                count: count as number,
                            })
                        )
                    );
                }

                return statsProfile;
            });
        } catch (error) {
            logger.error(
                `[StatsDAO.saveStatsProfile] Error for userId: ${statsProfile.userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to save stats: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }
}
