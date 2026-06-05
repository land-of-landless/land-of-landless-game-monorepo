import { db } from "./connection.js";
import {
    stats,
    lootBoxesByType,
    launchesByItem,
} from "../models/schema.js";
import { eq } from "drizzle-orm";
import logger from "@/utils/logger.js";
import { ERRORS } from "@/common/errors/appError.js";

/**
 * Data Access Object for user Stats operations.
 * Handles database persistence and retrieval for stats profiles in PostgreSQL.
 * Stores lifetime counters (loot boxes opened, launches, etc.).
 */
export default class StatsDAO {
    /**
     * Creates a new Stats profile for a user.
     * @param statsData - The initial stats data to persist.
     * @returns The created stats data.
     */
    static async createStats(statsData: any) {
        try {
            return await db.transaction(async (tx) => {
                await tx.insert(stats).values({
                    userId: statsData.userId,
                    lootBoxesOpenedTotal: statsData.loot_boxes_opened_total ?? 0,
                    launchesTotal: statsData.launches_total ?? 0,
                });

                const lootBoxesByTypeObj: Record<string, number> =
                    statsData.loot_boxes_opened_by_type ?? {};
                const lootBoxEntries = Object.entries(lootBoxesByTypeObj);
                if (lootBoxEntries.length > 0) {
                    await tx.insert(lootBoxesByType).values(
                        lootBoxEntries.map(([boxType, count]) => ({
                            userId: statsData.userId,
                            boxType,
                            count,
                        })),
                    );
                }

                const launchesByItemObj: Record<string, number> =
                    statsData.launches_by_item ?? {};
                const launchEntries = Object.entries(launchesByItemObj);
                if (launchEntries.length > 0) {
                    await tx.insert(launchesByItem).values(
                        launchEntries.map(([itemType, count]) => ({
                            userId: statsData.userId,
                            itemType,
                            count,
                        })),
                    );
                }

                return statsData;
            });
        } catch (error) {
            logger.error(`[StatsDAO.createStats] Error for userId: ${statsData.userId}`, { error });
            throw ERRORS.DB_ERROR(
                `Failed to create stats: ${error instanceof Error ? error.message : "Unknown error"}`,
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
                where: eq(stats.userId, userId),
                with: {
                    lootBoxesByType: true,
                    launchesByItem: true,
                },
            });

            if (!statsProfile) return null;

            const { lootBoxesByType: lootBoxRows, launchesByItem: launchRows, ...statsData } =
                statsProfile;

            const loot_boxes_opened_by_type: Record<string, number> = {};
            for (const row of lootBoxRows) {
                loot_boxes_opened_by_type[row.boxType] = row.count;
            }

            const launches_by_item: Record<string, number> = {};
            for (const row of launchRows) {
                launches_by_item[row.itemType] = row.count;
            }

            return {
                userId: statsData.userId,
                loot_boxes_opened_total: statsData.lootBoxesOpenedTotal,
                launches_total: statsData.launchesTotal,
                loot_boxes_opened_by_type,
                launches_by_item,
            };
        } catch (error) {
            logger.error(`[StatsDAO.findStatsByUserId] Error for userId: ${userId}`, { error });
            throw ERRORS.DB_ERROR(
                `Failed to find stats: ${error instanceof Error ? error.message : "Unknown error"}`,
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
            return await db.transaction(async (tx) => {
                await tx
                    .insert(stats)
                    .values({
                        userId: statsProfile.userId,
                        lootBoxesOpenedTotal: statsProfile.loot_boxes_opened_total ?? 0,
                        launchesTotal: statsProfile.launches_total ?? 0,
                    })
                    .onConflictDoUpdate({
                        target: stats.userId,
                        set: {
                            lootBoxesOpenedTotal: statsProfile.loot_boxes_opened_total ?? 0,
                            launchesTotal: statsProfile.launches_total ?? 0,
                        },
                    });

                await tx
                    .delete(lootBoxesByType)
                    .where(eq(lootBoxesByType.userId, statsProfile.userId));
                const lootBoxesByTypeObj: Record<string, number> =
                    statsProfile.loot_boxes_opened_by_type ?? {};
                const lootBoxEntries = Object.entries(lootBoxesByTypeObj);
                if (lootBoxEntries.length > 0) {
                    await tx.insert(lootBoxesByType).values(
                        lootBoxEntries.map(([boxType, count]) => ({
                            userId: statsProfile.userId,
                            boxType,
                            count,
                        })),
                    );
                }

                await tx
                    .delete(launchesByItem)
                    .where(eq(launchesByItem.userId, statsProfile.userId));
                const launchesByItemObj: Record<string, number> =
                    statsProfile.launches_by_item ?? {};
                const launchEntries = Object.entries(launchesByItemObj);
                if (launchEntries.length > 0) {
                    await tx.insert(launchesByItem).values(
                        launchEntries.map(([itemType, count]) => ({
                            userId: statsProfile.userId,
                            itemType,
                            count,
                        })),
                    );
                }

                return statsProfile;
            });
        } catch (error) {
            logger.error(`[StatsDAO.saveStatsProfile] Error for userId: ${statsProfile.userId}`, { error });
            throw ERRORS.DB_ERROR(
                `Failed to save stats: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }
}
