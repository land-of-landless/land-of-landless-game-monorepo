import { db } from "./connection.js";
import { mines, miners } from "../../models/schema.ts";
import { eq } from "drizzle-orm";
import logger from "@/utils/logger.js";
import { ERRORS } from "@/common/errors/appError.js";

/**
 * Data Access Object for Mine-related operations.
 * Handles database persistence and retrieval for mine profiles in PostgreSQL.
 */
export default class MineDAO {
    /**
     * Creates a new Mine profile for a user.
     * @param mineData - The initial data for the mine.
     * @returns The created mine data.
     */
    static async createMine(mineData: any) {
        try {
            return await db.transaction(async tx => {
                await tx.insert(mines).values({
                    userId: mineData.userId,
                    beingUpgradedMinerId:
                        mineData.being_upgraded_miner_id ?? -1,
                    upgradeTimer: mineData.upgrade_timer
                        ? new Date(mineData.upgrade_timer)
                        : null,
                });

                const minersInfo = mineData.miners_info;
                if (minersInfo) {
                    const minerRows = [
                        {
                            userId: mineData.userId,
                            minerId: 1,
                            level: minersInfo.miner1?.level ?? 0,
                        },
                        {
                            userId: mineData.userId,
                            minerId: 2,
                            level: minersInfo.miner2?.level ?? 0,
                        },
                        {
                            userId: mineData.userId,
                            minerId: 3,
                            level: minersInfo.miner3?.level ?? 0,
                        },
                    ];
                    await tx.insert(miners).values(minerRows);
                }

                return mineData;
            });
        } catch (error) {
            logger.error(
                `[MineDAO.createMine] Error for userId: ${mineData.userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to create mine: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Finds a Mine profile by user ID.
     * @param userId - The ID of the user to find the mine for.
     * @returns The mine data if found, otherwise null.
     */
    static async findMineByUserId(userId: string) {
        try {
            const mine = await db.query.mines.findFirst({
                where: eq(mines.userId, userId),
                with: {
                    miners: true,
                },
            });

            if (!mine) return null;

            const { miners: minerRows, ...mineData } = mine;

            const minersInfo: Record<string, { level: number }> = {
                miner1: { level: 0 },
                miner2: { level: 0 },
                miner3: { level: 0 },
            };
            for (const miner of minerRows) {
                const key = `miner${miner.minerId}` as
                    | "miner1"
                    | "miner2"
                    | "miner3";
                minersInfo[key] = { level: miner.level };
            }

            return {
                userId: mineData.userId,
                being_upgraded_miner_id: mineData.beingUpgradedMinerId,
                upgrade_timer: mineData.upgradeTimer?.toISOString() || "",
                miners_info: minersInfo,
            };
        } catch (error) {
            logger.error(
                `[MineDAO.findMineByUserId] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to find mine: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Saves (upserts) a Mine profile.
     * @param mineProfile - The mine profile data to save.
     * @returns The saved mine data.
     */
    static async saveMineProfile(mineProfile: any) {
        try {
            return await db.transaction(async tx => {
                await tx
                    .insert(mines)
                    .values({
                        userId: mineProfile.userId,
                        beingUpgradedMinerId:
                            mineProfile.being_upgraded_miner_id ?? -1,
                        upgradeTimer: mineProfile.upgrade_timer
                            ? new Date(mineProfile.upgrade_timer)
                            : null,
                    })
                    .onConflictDoUpdate({
                        target: mines.userId,
                        set: {
                            beingUpgradedMinerId:
                                mineProfile.being_upgraded_miner_id ?? -1,
                            upgradeTimer: mineProfile.upgrade_timer
                                ? new Date(mineProfile.upgrade_timer)
                                : null,
                        },
                    });

                await tx
                    .delete(miners)
                    .where(eq(miners.userId, mineProfile.userId));

                const minersInfo = mineProfile.miners_info;
                if (minersInfo) {
                    const minerRows = [
                        {
                            userId: mineProfile.userId,
                            minerId: 1,
                            level: minersInfo.miner1?.level ?? 0,
                        },
                        {
                            userId: mineProfile.userId,
                            minerId: 2,
                            level: minersInfo.miner2?.level ?? 0,
                        },
                        {
                            userId: mineProfile.userId,
                            minerId: 3,
                            level: minersInfo.miner3?.level ?? 0,
                        },
                    ];
                    await tx.insert(miners).values(minerRows);
                }

                return mineProfile;
            });
        } catch (error) {
            logger.error(
                `[MineDAO.saveMineProfile] Error for userId: ${mineProfile.userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to save mine: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }
}
