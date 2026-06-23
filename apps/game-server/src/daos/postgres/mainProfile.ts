import { db } from "./connection.js";
import {
    mainProfiles,
    lootBoxesByType,
    MainProfileTable,
    MainProfileLootBox,
    MainProfileWorkerBot,
    NewMainProfileTable,
    NewMainProfileWorkerBot,
    mainProfileWorkerBots,
    NewMainProfileLootBox,
    mainProfileLootBoxes,
} from "@/models/postgres/schema.js";
import { and, asc, eq, inArray } from "drizzle-orm";
import logger from "@/utils/logger.js";
import { ERRORS } from "@/common/errors/appError.js";
import { MiniGamesLootBox } from "@/constants/miniGames.js";
import { MainProfile, WorkerBotType } from "@/types/mainProfile.js";
import _ from "lodash";

// a typescript type that extends MainProfileTable to include "workerBots" and "lootBoxes"
type MainProfileWithRelations = MainProfileTable & {
    workerBots: MainProfileWorkerBot[];
    lootBoxes: MainProfileLootBox[];
};

/**
 * Data Access Object for MainProfile-related operations.
 * Handles database persistence and retrieval for main user profiles in PostgreSQL.
 */
export default class MainProfileDAO {
    /**
     * Creates a new main profile for a user.
     * @param profileData - The initial profile data.
     * @returns The created profile data.
     */
    static async createMainProfile(profileData: NewMainProfileTable) {
        try {
            const data = await db
                .insert(mainProfiles)
                .values(profileData)
                .returning();
            if (data.length === 0) {
                throw ERRORS.DB_ERROR("Failed to create profile");
            }
            return data[0];
        } catch (error) {
            logger.error(
                `[MainProfileDAO.createMainProfile] Error for userId: ${profileData.user_id}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to create profile: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Create worker bot table.
     * @param workerBotsData - The worker bots table data.
     * @returns The created worker bots table data.
     */
    static async createWorkerBots(workerBotsData: NewMainProfileWorkerBot[]) {
        try {
            const data = await db
                .insert(mainProfileWorkerBots)
                .values(workerBotsData)
                .returning();
            if (data.length === 0) {
                throw ERRORS.DB_ERROR("Failed to create worker bots");
            }
            return data;
        } catch (error) {
            logger.error(`[MainProfileDAO.createWorkerBots] Error`, { error });
            throw ERRORS.DB_ERROR(
                `Failed to create worker bots: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Create loot box table.
     * @param lootBoxesData - The loot boxes table data.
     * @returns The created loot boxes table data.
     */
    static async createLootBoxes(lootBoxesData: NewMainProfileLootBox[]) {
        try {
            const data = await db
                .insert(mainProfileLootBoxes)
                .values(lootBoxesData)
                .returning();
            if (data.length === 0) {
                throw ERRORS.DB_ERROR("Failed to create loot boxes");
            }
            return data;
        } catch (error) {
            logger.error(`[MainProfileDAO.createLootBoxes] Error`, { error });
            throw ERRORS.DB_ERROR(
                `Failed to create loot boxes: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Update an existing user main profile.
     * @param userId - The user ID to update.
     * @param updates - The fields to update (excluding user_id).
     * @returns The updated main profile data.
     */
    static async updateMainProfile(
        userId: string,
        updates: Partial<Omit<NewMainProfileTable, "user_id">>
    ) {
        try {
            const data = await db
                .update(mainProfiles)
                .set(updates)
                .where(eq(mainProfiles.user_id, userId))
                .returning();
            if (data.length === 0) {
                throw ERRORS.DB_ERROR("Main profile not found");
            }
            return data[0];
        } catch (error) {
            logger.error(
                `[MainProfileDAO.updateMainProfile] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to update main profile: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Update multiple worker bots in a single transaction.
     * Each bot in the array must have an 'id' field.
     * @param userId - The user id.
     * @param workerBotsData - Array of worker bot updates with required 'id' field.
     */
    static async updateWorkerBots(
        userId: string,
        workerBotsData: (Partial<Omit<MainProfileWorkerBot, "user_id">> & {
            id: number;
        })[]
    ) {
        try {
            await db.transaction(async tx => {
                for (let workerBotData of workerBotsData) {
                    const { id, ...updates } = workerBotData;
                    await tx
                        .update(mainProfileWorkerBots)
                        .set(updates)
                        .where(
                            and(
                                eq(mainProfileWorkerBots.user_id, userId),
                                eq(mainProfileWorkerBots.id, id)
                            )
                        );
                }
            });
        } catch (error) {
            logger.error(`[MainProfileDAO.updateWorkerBots] Error`, { error });
            throw ERRORS.DB_ERROR(
                `Failed to update worker bots: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Update a specific worker bot by ID.
     * @param userId - The user ID.
     * @param botId - The worker bot ID.
     * @param botData - The fields to update.
     * @returns The updated worker bot.
     */
    static async updateWorkerBotById(
        userId: string,
        botId: number,
        botData: Partial<Omit<MainProfileWorkerBot, "user_id" | "id">>
    ) {
        try {
            const data = await db
                .update(mainProfileWorkerBots)
                .set(botData)
                .where(
                    and(
                        eq(mainProfileWorkerBots.user_id, userId),
                        eq(mainProfileWorkerBots.id, botId)
                    )
                )
                .returning();
            if (data.length === 0) {
                throw ERRORS.DB_ERROR("Worker bot not found");
            }
            return data[0];
        } catch (error) {
            logger.error(
                `[MainProfileDAO.updateWorkerBotById] Error for botId: ${botId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to update worker bot: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Update multiple loot boxes in a single transaction.
     * Each box in the array must have an 'id' field.
     * @param userId - The user id.
     * @param lootBoxesData - Array of loot box updates with required 'id' field.
     */
    static async updateLootBoxes(
        userId: string,
        lootBoxesData: (Partial<Omit<MainProfileLootBox, "user_id">> & {
            id: number;
        })[]
    ) {
        try {
            await db.transaction(async tx => {
                for (let lootBoxData of lootBoxesData) {
                    const { id, ...updates } = lootBoxData;
                    await tx
                        .update(mainProfileLootBoxes)
                        .set(updates)
                        .where(
                            and(
                                eq(mainProfileLootBoxes.user_id, userId),
                                eq(mainProfileLootBoxes.id, id)
                            )
                        );
                }
            });
        } catch (error) {
            logger.error(`[MainProfileDAO.updateLootBoxes] Error`, { error });
            throw ERRORS.DB_ERROR(
                `Failed to update loot boxes: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Update a specific loot box by ID.
     * @param userId - The user ID.
     * @param boxId - The loot box ID.
     * @param boxData - The fields to update.
     * @returns The updated loot box.
     */
    static async updateLootBoxById(
        userId: string,
        boxId: number,
        boxData: Partial<Omit<MainProfileLootBox, "user_id" | "id">>
    ) {
        try {
            const data = await db
                .update(mainProfileLootBoxes)
                .set(boxData)
                .where(
                    and(
                        eq(mainProfileLootBoxes.user_id, userId),
                        eq(mainProfileLootBoxes.id, boxId)
                    )
                )
                .returning();
            if (data.length === 0) {
                throw ERRORS.DB_ERROR("Loot box not found");
            }
            return data[0];
        } catch (error) {
            logger.error(
                `[MainProfileDAO.updateLootBoxById] Error for boxId: ${boxId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to update loot box: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Delete a row from worker bots table.
     * @param userId - The user id.
     * @param workerBotId - The worker bot id.
     */
    static async deleteWorkerBot(userId: string, workerBotId: number) {
        try {
            await db
                .delete(mainProfileWorkerBots)
                .where(
                    and(
                        eq(mainProfileWorkerBots.user_id, userId),
                        eq(mainProfileWorkerBots.id, workerBotId)
                    )
                );
        } catch (error) {
            logger.error(`[MainProfileDAO.deleteWorkerBot] Error`, { error });
            throw ERRORS.DB_ERROR(
                `Failed to delete worker bot: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Delete multiple worker bots by IDs.
     * @param userId - The user id.
     * @param botIds - Array of worker bot IDs to delete.
     */
    static async deleteWorkerBotsByIds(userId: string, botIds: number[]) {
        try {
            if (botIds.length === 0) {
                return;
            }
            await db
                .delete(mainProfileWorkerBots)
                .where(
                    and(
                        eq(mainProfileWorkerBots.user_id, userId),
                        inArray(mainProfileWorkerBots.id, botIds)
                    )
                );
        } catch (error) {
            logger.error(
                `[MainProfileDAO.deleteWorkerBotsByIds] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to delete worker bots: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Delete a row from loot box table.
     * @param userId - The user id.
     * @param lootBoxId - The loot box id.
     */
    static async deleteLootBox(userId: string, lootBoxId: number) {
        try {
            await db
                .delete(mainProfileLootBoxes)
                .where(
                    and(
                        eq(mainProfileLootBoxes.user_id, userId),
                        eq(mainProfileLootBoxes.id, lootBoxId)
                    )
                );
        } catch (error) {
            logger.error(`[MainProfileDAO.deleteLootBox] Error`, { error });
            throw ERRORS.DB_ERROR(
                `Failed to delete loot box: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Delete all loot boxes for a user.
     * @param userId - The user id.
     */
    static async deleteLootBoxesByUserId(userId: string) {
        try {
            await db
                .delete(mainProfileLootBoxes)
                .where(eq(mainProfileLootBoxes.user_id, userId));
        } catch (error) {
            logger.error(
                `[MainProfileDAO.deleteLootBoxesByUserId] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to delete loot boxes: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Delete a user main profile.
     * @param userId - The user id.
     */
    static async deleteMainProfile(userId: string) {
        try {
            await db
                .delete(mainProfiles)
                .where(eq(mainProfiles.user_id, userId));
        } catch (error) {
            logger.error(
                `[MainProfileDAO.deleteMainProfile] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to delete main profile: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Delete a complete profile (main profile + all related worker bots and loot boxes).
     * Uses transactions to ensure atomicity.
     * @param userId - The user id.
     */
    static async deleteCompleteProfile(userId: string) {
        try {
            return await db.transaction(async tx => {
                // Delete loot boxes
                await tx
                    .delete(mainProfileLootBoxes)
                    .where(eq(mainProfileLootBoxes.user_id, userId));

                // Delete worker bots
                await tx
                    .delete(mainProfileWorkerBots)
                    .where(eq(mainProfileWorkerBots.user_id, userId));

                // Delete main profile
                await tx
                    .delete(mainProfiles)
                    .where(eq(mainProfiles.user_id, userId));
            });
        } catch (error) {
            logger.error(
                `[MainProfileDAO.deleteCompleteProfile] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to delete complete profile: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Find a user main profile by userId.
     * @param userId - The user ID.
     * @param withRelations - Whether to include related worker bots and loot boxes.
     * @returns The profile if found, otherwise null.
     */
    static async findProfileByUserId(
        userId: string,
        withRelations: boolean = false
    ): Promise<MainProfileTable | MainProfileWithRelations | null> {
        try {
            if (withRelations) {
                return (await db.query.mainProfiles.findFirst({
                    where: eq(mainProfiles.user_id, userId),
                    with: {
                        workerBots: {
                            orderBy: asc(mainProfileWorkerBots.position),
                        },
                        lootBoxes: {
                            orderBy: asc(mainProfileLootBoxes.position),
                        },
                    },
                })) as MainProfileWithRelations | null;
            } else {
                return (await db.query.mainProfiles.findFirst({
                    where: eq(mainProfiles.user_id, userId),
                })) as MainProfileTable | null;
            }
        } catch (error) {
            logger.error(
                `[MainProfileDAO.findProfileByUserId] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to find main profile: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Finds a main profile by referral code.
     * @param refCode - The referral code to look up.
     * @param withRelations - Whether to include related worker bots and loot boxes.
     * @returns The profile data if found, otherwise null.
     */
    static async findProfileByRefCode(
        refCode: string,
        withRelations: boolean = false
    ): Promise<MainProfileTable | MainProfileWithRelations | null> {
        try {
            if (withRelations) {
                return (await db.query.mainProfiles.findFirst({
                    where: eq(mainProfiles.ref_code, refCode),
                    with: {
                        workerBots: {
                            orderBy: asc(mainProfileWorkerBots.position),
                        },
                        lootBoxes: {
                            orderBy: asc(mainProfileLootBoxes.position),
                        },
                    },
                })) as MainProfileWithRelations | null;
            } else {
                return (await db.query.mainProfiles.findFirst({
                    where: eq(mainProfiles.ref_code, refCode),
                })) as MainProfileTable | null;
            }
        } catch (error) {
            logger.error(
                `[MainProfileDAO.findProfileByRefCode] Error for refCode: ${refCode}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to find profile by ref code: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Find a worker bot by user ID and bot ID.
     * @param userId - The user id.
     * @param botId - The worker bot id.
     * @returns The worker bot if found, otherwise null.
     */
    static async findWorkerBotById(
        userId: string,
        botId: number
    ): Promise<MainProfileWorkerBot | null> {
        try {
            return await db.query.mainProfileWorkerBots.findFirst({
                where: and(
                    eq(mainProfileWorkerBots.user_id, userId),
                    eq(mainProfileWorkerBots.id, botId)
                ),
            });
        } catch (error) {
            logger.error(
                `[MainProfileDAO.findWorkerBotById] Error for botId: ${botId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to find worker bot: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Find a loot box by user ID and box ID.
     * @param userId - The user id.
     * @param boxId - The loot box id.
     * @returns The loot box if found, otherwise null.
     */
    static async findLootBoxById(
        userId: string,
        boxId: number
    ): Promise<MainProfileLootBox | null> {
        try {
            return await db.query.mainProfileLootBoxes.findFirst({
                where: and(
                    eq(mainProfileLootBoxes.user_id, userId),
                    eq(mainProfileLootBoxes.id, boxId)
                ),
            });
        } catch (error) {
            logger.error(
                `[MainProfileDAO.findLootBoxById] Error for boxId: ${boxId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to find loot box: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Find all worker bots for a user.
     * @param userId - The user id.
     * @returns Array of worker bots for the user.
     */
    static async findWorkerBotsByUserId(
        userId: string
    ): Promise<MainProfileWorkerBot[]> {
        try {
            return await db.query.mainProfileWorkerBots.findMany({
                where: eq(mainProfileWorkerBots.user_id, userId),
                orderBy: asc(mainProfileWorkerBots.position),
            });
        } catch (error) {
            logger.error(
                `[MainProfileDAO.findWorkerBotsByUserId] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to find worker bots: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Find all loot boxes for a user.
     * @param userId - The user id.
     * @returns Array of loot boxes for the user.
     */
    static async findLootBoxesByUserId(
        userId: string
    ): Promise<MainProfileLootBox[]> {
        try {
            return await db.query.mainProfileLootBoxes.findMany({
                where: eq(mainProfileLootBoxes.user_id, userId),
                orderBy: asc(mainProfileLootBoxes.position),
            });
        } catch (error) {
            logger.error(
                `[MainProfileDAO.findLootBoxesByUserId] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to find loot boxes: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Finds all main profiles.
     * @param withRelations - Whether to include related worker bots and loot boxes.
     * @returns An array of all profile data.
     */
    static async findAllProfiles(
        withRelations: boolean = false
    ): Promise<any[]> {
        try {
            if (withRelations) {
                return (await db.query.mainProfiles.findMany({
                    with: {
                        workerBots: {
                            orderBy: asc(mainProfileWorkerBots.position),
                        },
                        lootBoxes: {
                            orderBy: asc(mainProfileLootBoxes.position),
                        },
                    },
                })) as any[];
            } else {
                return await db.query.mainProfiles.findMany();
            }
        } catch (error) {
            logger.error(
                `[MainProfileDAO.findAllProfiles] Error fetching all profiles`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to find all profiles: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Create a complete profile with worker bots and loot boxes in a single transaction.
     * Ensures all-or-nothing atomicity.
     * @param profileData - The main profile data.
     * @param workerBotsData - Optional array of worker bots to create.
     * @param lootBoxesData - Optional array of loot boxes to create.
     * @returns The created main profile.
     */
    static async createCompleteProfile(
        profileData: NewMainProfileTable,
        workerBotsData?: NewMainProfileWorkerBot[],
        lootBoxesData?: NewMainProfileLootBox[]
    ) {
        try {
            return await db.transaction(async tx => {
                // 1. Create main profile
                const profile = await tx
                    .insert(mainProfiles)
                    .values(profileData)
                    .returning();

                if (profile.length === 0) {
                    throw ERRORS.DB_ERROR("Failed to create profile");
                }

                // 2. Create worker bots if provided
                if (workerBotsData && workerBotsData.length > 0) {
                    await tx
                        .insert(mainProfileWorkerBots)
                        .values(workerBotsData);
                }

                // 3. Create loot boxes if provided
                if (lootBoxesData && lootBoxesData.length > 0) {
                    await tx.insert(mainProfileLootBoxes).values(lootBoxesData);
                }

                return profile[0];
            });
        } catch (error) {
            logger.error(
                `[MainProfileDAO.createCompleteProfile] Error for userId: ${profileData.user_id}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to create complete profile: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Increment a numeric field in the profile by a given amount.
     * Useful for adding resources like coins, gems, XP, etc.
     * Prevents values from going negative.
     * @param userId - The user id.
     * @param field - The field to increment.
     * @param amount - The amount to add (can be negative for subtraction).
     * @returns The updated profile.
     */
    static async incrementProfileField(
        userId: string,
        field: "coins" | "gems" | "xp" | "referrals" | "loot_box_keys",
        amount: number
    ): Promise<MainProfileTable> {
        try {
            const profile = await db.query.mainProfiles.findFirst({
                where: eq(mainProfiles.user_id, userId),
            });

            if (!profile) {
                throw ERRORS.DB_ERROR("Profile not found");
            }

            const currentValue = profile[field] as number;
            const newValue = Math.max(0, currentValue + amount);

            const data = await db
                .update(mainProfiles)
                .set({ [field]: newValue })
                .where(eq(mainProfiles.user_id, userId))
                .returning();

            if (data.length === 0) {
                throw ERRORS.DB_ERROR("Failed to increment profile field");
            }

            return data[0];
        } catch (error) {
            logger.error(
                `[MainProfileDAO.incrementProfileField] Error for userId: ${userId}, field: ${field}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to increment profile field: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Add coins to a user's profile.
     * @param userId - The user id.
     * @param amount - The amount of coins to add.
     * @returns The updated profile.
     */
    static async addCoins(
        userId: string,
        amount: number
    ): Promise<MainProfileTable> {
        return this.incrementProfileField(userId, "coins", amount);
    }

    /**
     * Add gems to a user's profile.
     * @param userId - The user id.
     * @param amount - The amount of gems to add.
     * @returns The updated profile.
     */
    static async addGems(
        userId: string,
        amount: number
    ): Promise<MainProfileTable> {
        return this.incrementProfileField(userId, "gems", amount);
    }

    /**
     * Add XP to a user's profile.
     * @param userId - The user id.
     * @param amount - The amount of XP to add.
     * @returns The updated profile.
     */
    static async addXp(
        userId: string,
        amount: number
    ): Promise<MainProfileTable> {
        return this.incrementProfileField(userId, "xp", amount);
    }

    /**
     * Add loot box keys to a user's profile.
     * @param userId - The user id.
     * @param amount - The amount of keys to add.
     * @returns The updated profile.
     */
    static async addLootBoxKeys(
        userId: string,
        amount: number
    ): Promise<MainProfileTable> {
        return this.incrementProfileField(userId, "loot_box_keys", amount);
    }

    /**
     * Add referrals to a user's profile.
     * @param userId - The user id.
     * @param amount - The amount of referrals to add.
     * @returns The updated profile.
     */
    static async addReferrals(
        userId: string,
        amount: number
    ): Promise<MainProfileTable> {
        return this.incrementProfileField(userId, "referrals", amount);
    }
}
