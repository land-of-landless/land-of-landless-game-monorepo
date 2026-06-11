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
import { and, asc, eq } from "drizzle-orm";
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
            if (data.length == 0) {
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
     * create worker bot table
     * @param workerBotsData - The worker bots table data.
     * @returns The created worker bots table data.
     */
    static async createWorkerBots(workerBotsData: NewMainProfileWorkerBot[]) {
        try {
            const data = await db
                .insert(mainProfileWorkerBots)
                .values(workerBotsData)
                .returning();
            if (data.length == 0) {
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
     * create loot box table
     * @param lootBoxesData - The loot boxes table data.
     * @returns The created loot boxes table data.
     */
    static async createLootBoxes(lootBoxesData: NewMainProfileLootBox[]) {
        try {
            const data = await db
                .insert(mainProfileLootBoxes)
                .values(lootBoxesData)
                .returning();
            if (data.length == 0) {
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
     * update an existing user main profile
     * @param profileData - The main profile data to update.
     * @returns The updated main profile data.
     */
    static async updateMainProfile(profileData: Partial<NewMainProfileTable>) {
        try {
            const data = await db
                .update(mainProfiles)
                .set(profileData)
                .where(eq(mainProfiles.user_id, profileData.user_id))
                .returning();
            if (data.length == 0) {
                throw ERRORS.DB_ERROR("Failed to update main profile");
            }
            return data[0];
        } catch (error) {
            logger.error(`[MainProfileDAO.updateMainProfile] Error`, { error });
            throw ERRORS.DB_ERROR(
                `Failed to update main profile: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * update worker bot table
     * @param workerBotsData - The worker bots table data.
     * @returns The updated worker bots table data.
     */
    static async updateWorkerBots(
        userId: string,
        workerBotsData: Partial<MainProfileWorkerBot>[]
    ) {
        try {
            await db.transaction(async tx => {
                for (let workerBotData of workerBotsData) {
                    await tx
                        .update(mainProfileWorkerBots)
                        .set(workerBotData)
                        .where(eq(mainProfileWorkerBots.user_id, userId));
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
     * update loot box table
     * @param lootBoxesData - The loot boxes table data.
     * @returns The updated loot boxes table data.
     */
    static async updateLootBoxes(
        userId: string,
        lootBoxesData: Partial<MainProfileLootBox>[]
    ) {
        try {
            await db.transaction(async tx => {
                for (let lootBoxData of lootBoxesData) {
                    await tx
                        .update(mainProfileLootBoxes)
                        .set(lootBoxData)
                        .where(eq(mainProfileLootBoxes.user_id, userId));
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
     * delete a row from worker bots table
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
     * delete a row from loot box table
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
     * delete a user main profile
     * @param userId - The user id.
     */
    static async deleteMainProfile(userId: string) {
        try {
            await db
                .delete(mainProfiles)
                .where(eq(mainProfiles.user_id, userId));
        } catch (error) {
            logger.error(`[MainProfileDAO.deleteMainProfile] Error`, { error });
            throw ERRORS.DB_ERROR(
                `Failed to delete main profile: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * find a user main profile by userId
     */
    static async findProfileByUserId(userId: string, withRelations?: boolean) {
        try {
            let profile: MainProfileTable | MainProfileWithRelations | null;
            if (withRelations) {
                profile = (await db.query.mainProfiles.findFirst({
                    where: eq(mainProfiles.user_id, userId),
                    with: {
                        workerBots: {
                            orderBy: asc(mainProfileWorkerBots.position),
                        },
                        lootBoxes: {
                            orderBy: asc(mainProfileLootBoxes.position),
                        },
                    },
                })) as MainProfileWithRelations;
            } else {
                profile = (await db.query.mainProfiles.findFirst({
                    where: eq(mainProfiles.user_id, userId),
                })) as MainProfileTable;
            }

            if (_.isNil(profile)) {
                return null;
            }

            return profile;
        } catch (error) {
            logger.error(`[MainProfileDAO.findProfileByUserId] Error`, {
                error,
            });
            throw ERRORS.DB_ERROR(
                `Failed to find main profile: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Finds a main profile by user ID.
     * @param userId - The ID of the user.
     * @returns The profile data if found, otherwise null.
     */
    static async findProfileByUserId(
        userId: string
    ): Promise<MainProfileTable | null> {
        try {
            const profile = await db.query.mainProfiles.findFirst({
                where: eq(mainProfiles.user_id, userId),
                with: {
                    workerBots: {
                        orderBy: (wb: any, { asc }: any) => [asc(wb.position)],
                    },
                    lootBoxes: {
                        orderBy: (lb: any, { asc }: any) => [asc(lb.position)],
                    },
                },
            });

            if (!profile) return null;

            // Fetch loot boxes opened from stats table
            const dbLootBoxesOpened = await db
                .select()
                .from(lootBoxesByType)
                .where(eq(lootBoxesByType.user_id, userId));

            const boxTypes = [
                "common",
                "uncommon",
                "rare",
                "epic",
                "legendary",
                "custom",
            ];
            const lootBoxes_opened = boxTypes.map(type => {
                const found = dbLootBoxesOpened.find(
                    row => row.box_type === type
                );
                return found ? found.count : 0;
            });

            // Extract relations to prevent them from being included twice or as raw objects in the spread
            const {
                workerBots,
                lootBoxes: dbLootBoxes,
                tickets_type1,
                tickets_type2,
                game_pass,
                game_pass_purchase_time,
                loot_box_keys,
                energy_generation_rate,
                energy_max,
                energy_updated_at,
                mineral_generation_rate,
                mineral_max,
                mineral_updated_at,
                atmosphere_trash_type1,
                atmosphere_trash_type2,
                atmosphere_trash_updated_at,
                last_daily_reward_claimed_at,
                ...profileData
            } = profile;

            return {
                userId: profile.user_id,
                profilePictureIndex: profile.profile_picture_index,
                name: profile.name,
                representedFlag: profile.represented_flag || undefined,
                refCode: profile.ref_code,
                game_pass,
                game_pass_purchase_time:
                    game_pass_purchase_time?.toISOString() || "",
                worker_bots: workerBots.map(b => b.bot_type as WorkerBotType),
                lootBoxes: dbLootBoxes.map(
                    b => b.box_type as MiniGamesLootBox | ""
                ),
                lootBoxesTimers: dbLootBoxes.map(
                    b => b.timer?.toISOString() || ""
                ),
                lootBox_keys: loot_box_keys,
                lootBoxes_opened,
                tickets_type1,
                tickets_type2,
                coins: profile.coins,
                gems: profile.gems,
                xp: profile.xp,
                energy: profile.energy,
                energy_generation_rate,
                energy_max,
                energy_updated_at: energy_updated_at?.toISOString() || "",
                mineral: profile.mineral,
                mineral_generation_rate,
                mineral_max,
                mineral_updated_at: mineral_updated_at?.toISOString() || "",
                atmosphere_trash_type1,
                atmosphere_trash_type2,
                atmosphere_trash_updated_at:
                    atmosphere_trash_updated_at?.toISOString() || "",
                lastDailyRewardClaimedAt:
                    last_daily_reward_claimed_at?.toISOString() || "",
                dailyRewardClaimCounter: profile.daily_reward_claim_counter,
                referredBy: profile.referred_by || "",
                referrals: profile.referrals,
                lootBoxesOpeningRate: profile.loot_boxes_opening_rate,
            };
        } catch (error) {
            logger.error(
                `[MainProfileDAO.findProfileByUserId] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to find profile: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
    /**
     * Finds a main profile by referral code.
     * @param refCode - The referral code to look up.
     * @returns The profile data if found, otherwise null.
     */
    static async findProfileByRefCode(
        refCode: string
    ): Promise<MainProfileWithRelations | null> {
        try {
            const profile = await db.query.mainProfiles.findFirst({
                where: eq(mainProfiles.ref_code, refCode),
                with: {
                    workerBots: {
                        orderBy: asc(workerBots.position),
                    },
                    lootBoxes: {
                        orderBy: asc(lootBoxes.position),
                    },
                },
            });
            if (!profile) return null;

            return profile;
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
     * Finds all main profiles.
     * @returns An array of all profile data.
     */
    static async findAllProfiles() {
        try {
            const allProfiles = await db.query.mainProfiles.findMany();
            // This is expensive if we fetch relations for all, but for migration purposes:
            return Promise.all(
                allProfiles.map(p =>
                    this.findProfileByUserId(p.user_id as string)
                )
            );
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
     * Finds a user profile by their user ID using Relational Query API for performance.
     * @param userId - The ID of the user.
     * @returns The MainProfile entity if found, otherwise null.
     */
    static async findProfileByIdFast(userId: string) {
        try {
            const profile = await db.query.mainProfiles.findFirst({
                where: (mainProfiles, { eq }) =>
                    eq(mainProfiles.user_id, userId),
                with: {
                    workerBots: {
                        orderBy: (wb: any, { asc }: any) => [asc(wb.position)],
                    },
                    lootBoxes: {
                        orderBy: (lb: any, { asc }: any) => [asc(lb.position)],
                    },
                },
            });

            if (!profile) return null;

            // Fetch loot boxes opened from stats table
            const dbLootBoxesOpened = await db
                .select()
                .from(lootBoxesByType)
                .where(eq(lootBoxesByType.user_id, userId));

            const boxTypes = [
                "common",
                "uncommon",
                "rare",
                "epic",
                "legendary",
                "custom",
            ];
            const lootBoxes_opened = boxTypes.map(type => {
                const found = dbLootBoxesOpened.find(
                    row => row.box_type === type
                );
                return found ? found.count : 0;
            });

            const {
                workerBots,
                lootBoxes: dbLootBoxes,
                tickets_type1,
                tickets_type2,
                game_pass,
                game_pass_purchase_time,
                loot_box_keys,
                energy_generation_rate,
                energy_max,
                energy_updated_at,
                mineral_generation_rate,
                mineral_max,
                mineral_updated_at,
                atmosphere_trash_type1,
                atmosphere_trash_type2,
                atmosphere_trash_updated_at,
                last_daily_reward_claimed_at,
                ...profileData
            } = profile;

            return {
                userId: profile.user_id,
                profilePictureIndex: profile.profile_picture_index,
                name: profile.name,
                representedFlag: profile.represented_flag || undefined,
                refCode: profile.ref_code,
                game_pass,
                game_pass_purchase_time:
                    game_pass_purchase_time?.toISOString() || "",
                worker_bots: workerBots.map(b => b.bot_type as WorkerBotType),
                lootBoxes: dbLootBoxes.map(
                    b => b.box_type as MiniGamesLootBox | ""
                ),
                lootBoxesTimers: dbLootBoxes.map(
                    b => b.timer?.toISOString() || ""
                ),
                lootBox_keys: loot_box_keys,
                lootBoxes_opened,
                tickets_type1,
                tickets_type2,
                coins: profile.coins,
                gems: profile.gems,
                xp: profile.xp,
                energy: profile.energy,
                energy_generation_rate,
                energy_max,
                energy_updated_at: energy_updated_at?.toISOString() || "",
                mineral: profile.mineral,
                mineral_generation_rate,
                mineral_max,
                mineral_updated_at: mineral_updated_at?.toISOString() || "",
                atmosphere_trash_type1,
                atmosphere_trash_type2,
                atmosphere_trash_updated_at:
                    atmosphere_trash_updated_at?.toISOString() || "",
                lastDailyRewardClaimedAt:
                    last_daily_reward_claimed_at?.toISOString() || "",
                dailyRewardClaimCounter: profile.daily_reward_claim_counter,
                referredBy: profile.referred_by || "",
                referrals: profile.referrals,
                lootBoxesOpeningRate: profile.loot_boxes_opening_rate,
            };
        } catch (error) {
            logger.error(
                `[MainProfileDAO.findProfileByIdFast] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to find profile (fast): ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }
}
