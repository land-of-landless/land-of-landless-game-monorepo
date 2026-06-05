import { db } from "./connection.js";
import {
    mainProfiles,
    workerBots,
    lootBoxes,
    lootBoxesOpened,
} from "../models/schema.js";
import { eq } from "drizzle-orm";
import logger from "@/utils/logger.js";
import { ERRORS } from "@/common/errors/appError.js";
import { MiniGamesLootBox } from "@/constants/miniGames.js";
import { MainProfile, WorkerBotType } from "@/types/mainProfile.js";

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
    static async createProfile(profileData: any) {
        try {
        return await db.transaction(async tx => {
            await tx.insert(mainProfiles).values({
                userId: profileData.userId,
                profilePictureIndex: profileData.profilePictureIndex,
                name: profileData.name,
                representedFlag: profileData.representedFlag,
                refCode: profileData.refCode,
                gamePass: profileData.game_pass,
                gamePassPurchaseTime: profileData.game_pass_purchase_time
                    ? new Date(profileData.game_pass_purchase_time)
                    : null,
                lootBoxesOpeningRate: profileData.lootBoxesOpeningRate,
                lootBoxKeys: profileData.lootBox_keys,
                coins: profileData.coins,
                gems: profileData.gems,
                ticketsType1: profileData.tickets_type1,
                ticketsType2: profileData.tickets_type2,
                xp: profileData.xp,
                energy: profileData.energy,
                energyGenerationRate: profileData.energy_generation_rate,
                energyMax: profileData.energy_max,
                energyUpdatedAt: profileData.energy_updated_at
                    ? new Date(profileData.energy_updated_at)
                    : null,
                mineral: profileData.mineral,
                mineralGenerationRate: profileData.mineral_generation_rate,
                mineralMax: profileData.mineral_max,
                mineralUpdatedAt: profileData.mineral_updated_at
                    ? new Date(profileData.mineral_updated_at)
                    : null,
                atmosphereTrashType1: profileData.atmosphere_trash_type1,
                atmosphereTrashType2: profileData.atmosphere_trash_type2,
                atmosphereTrashUpdatedAt:
                    profileData.atmosphere_trash_updated_at
                        ? new Date(profileData.atmosphere_trash_updated_at)
                        : null,
                lastDailyRewardClaimedAt: profileData.lastDailyRewardClaimedAt
                    ? new Date(profileData.lastDailyRewardClaimedAt)
                    : null,
                dailyRewardClaimCounter: profileData.dailyRewardClaimCounter,
                referredBy: profileData.referredBy,
                referrals: profileData.referrals,
            });

            if (profileData.worker_bots?.length > 0) {
                await tx.insert(workerBots).values(
                    profileData.worker_bots.map((botType: any) => ({
                        userId: profileData.userId,
                        botType,
                    }))
                );
            }

            if (profileData.lootBoxes?.length > 0) {
                await tx.insert(lootBoxes).values(
                    profileData.lootBoxes.map(
                        (boxType: any, index: number) => ({
                            userId: profileData.userId,
                            boxType,
                            timer: profileData.lootBoxesTimers?.[index]
                                ? new Date(profileData.lootBoxesTimers[index])
                                : null,
                            position: index,
                        })
                    )
                );
            }

            if (profileData.lootBoxes_opened?.length > 0) {
                await tx.insert(lootBoxesOpened).values(
                    profileData.lootBoxes_opened.map(
                        (count: number, index: number) => ({
                            userId: profileData.userId,
                            boxTypeIndex: index,
                            count,
                        })
                    )
                );
            }

            return profileData;
        });
        } catch (error) {
            logger.error(`[MainProfileDAO.createProfile] Error for userId: ${profileData.userId}`, { error });
            throw ERRORS.DB_ERROR(`Failed to create profile: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    /**
     * Saves an existing main profile.
     * @param profile - The profile data to save.
     * @returns The saved profile data.
     */
    static async saveProfile(profile: any) {
        try {
        return await db.transaction(async tx => {
            await tx
                .update(mainProfiles)
                .set({
                    profilePictureIndex: profile.profilePictureIndex,
                    name: profile.name,
                    representedFlag: profile.representedFlag,
                    refCode: profile.refCode,
                    gamePass: profile.game_pass,
                    gamePassPurchaseTime: profile.game_pass_purchase_time
                        ? new Date(profile.game_pass_purchase_time)
                        : null,
                    lootBoxesOpeningRate: profile.lootBoxesOpeningRate,
                    lootBoxKeys: profile.lootBox_keys,
                    coins: profile.coins,
                    gems: profile.gems,
                    ticketsType1: profile.tickets_type1,
                    ticketsType2: profile.tickets_type2,
                    xp: profile.xp,
                    energy: profile.energy,
                    energyGenerationRate: profile.energy_generation_rate,
                    energyMax: profile.energy_max,
                    energyUpdatedAt: profile.energy_updated_at
                        ? new Date(profile.energy_updated_at)
                        : null,
                    mineral: profile.mineral,
                    mineralGenerationRate: profile.mineral_generation_rate,
                    mineralMax: profile.mineral_max,
                    mineralUpdatedAt: profile.mineral_updated_at
                        ? new Date(profile.mineral_updated_at)
                        : null,
                    atmosphereTrashType1: profile.atmosphere_trash_type1,
                    atmosphereTrashType2: profile.atmosphere_trash_type2,
                    atmosphereTrashUpdatedAt:
                        profile.atmosphere_trash_updated_at
                            ? new Date(profile.atmosphere_trash_updated_at)
                            : null,
                    lastDailyRewardClaimedAt: profile.lastDailyRewardClaimedAt
                        ? new Date(profile.lastDailyRewardClaimedAt)
                        : null,
                    dailyRewardClaimCounter: profile.dailyRewardClaimCounter,
                    referredBy: profile.referredBy,
                    referrals: profile.referrals,
                })
                .where(eq(mainProfiles.userId, profile.userId));

            // Update worker bots (simpler to delete and re-insert for parallel impl)
            await tx
                .delete(workerBots)
                .where(eq(workerBots.userId, profile.userId));
            if (profile.worker_bots?.length > 0) {
                await tx.insert(workerBots).values(
                    profile.worker_bots.map((botType: any) => ({
                        userId: profile.userId,
                        botType,
                    }))
                );
            }

            // Update loot boxes
            await tx
                .delete(lootBoxes)
                .where(eq(lootBoxes.userId, profile.userId));
            if (profile.lootBoxes?.length > 0) {
                await tx.insert(lootBoxes).values(
                    profile.lootBoxes.map((boxType: any, index: number) => ({
                        userId: profile.userId,
                        boxType,
                        timer: profile.lootBoxesTimers?.[index]
                            ? new Date(profile.lootBoxesTimers[index])
                            : null,
                        position: index,
                    }))
                );
            }

            // Update loot boxes opened
            await tx
                .delete(lootBoxesOpened)
                .where(eq(lootBoxesOpened.userId, profile.userId));
            if (profile.lootBoxes_opened?.length > 0) {
                await tx.insert(lootBoxesOpened).values(
                    profile.lootBoxes_opened.map(
                        (count: number, index: number) => ({
                            userId: profile.userId,
                            boxTypeIndex: index,
                            count,
                        })
                    )
                );
            }

            return profile;
        });
        } catch (error) {
            logger.error(`[MainProfileDAO.saveProfile] Error for userId: ${profile.userId}`, { error });
            throw ERRORS.DB_ERROR(`Failed to save profile: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    /**
     * Finds a main profile by user ID.
     * @param userId - The ID of the user.
     * @returns The profile data if found, otherwise null.
     */
    static async findProfileByUserId(userId: string): Promise<MainProfile | null> {
        try {
        const profile = await db.query.mainProfiles.findFirst({
            where: eq(mainProfiles.userId, userId),
            with: {
                workerBots: true,
                lootBoxes: {
                    orderBy: (lootBoxes: { position: any }, { asc }: any) => [
                        asc(lootBoxes.position),
                    ],
                },
                lootBoxesOpened: {
                    orderBy: (
                        lootBoxesOpened: { boxTypeIndex: any },
                        { asc }: any
                    ) => [asc(lootBoxesOpened.boxTypeIndex)],
                },
            },
        });

        if (!profile) return null;

        // Extract relations to prevent them from being included twice or as raw objects in the spread
        const {
            workerBots,
            lootBoxes: dbLootBoxes,
            lootBoxesOpened,
            ticketsType1,
            ticketsType2,
            gamePass,
            gamePassPurchaseTime,
            lootBoxKeys,
            energyGenerationRate,
            energyMax,
            energyUpdatedAt,
            mineralGenerationRate,
            mineralMax,
            mineralUpdatedAt,
            atmosphereTrashType1,
            atmosphereTrashType2,
            atmosphereTrashUpdatedAt,
            lastDailyRewardClaimedAt,
            ...profileData
        } = profile;

        return {
            ...profileData,
            game_pass: gamePass,
            game_pass_purchase_time:
                gamePassPurchaseTime?.toISOString() || "",
            worker_bots: workerBots.map(b => b.botType as WorkerBotType),
            lootBoxes: dbLootBoxes.map(
                b => b.boxType as MiniGamesLootBox | "",
            ),
            lootBoxesTimers: dbLootBoxes.map(b => b.timer?.toISOString() || ""),
            lootBox_keys: lootBoxKeys,
            lootBoxes_opened: lootBoxesOpened.map(b => b.count),
            tickets_type1: ticketsType1,
            tickets_type2: ticketsType2,
            energy_generation_rate: energyGenerationRate,
            energy_max: energyMax,
            energy_updated_at: energyUpdatedAt?.toISOString() || "",
            mineral_generation_rate: mineralGenerationRate,
            mineral_max: mineralMax,
            mineral_updated_at: mineralUpdatedAt?.toISOString() || "",
            atmosphere_trash_type1: atmosphereTrashType1,
            atmosphere_trash_type2: atmosphereTrashType2,
            atmosphere_trash_updated_at:
                atmosphereTrashUpdatedAt?.toISOString() || "",
            lastDailyRewardClaimedAt:
                lastDailyRewardClaimedAt?.toISOString() || "",
        };
        } catch (error) {
            logger.error(`[MainProfileDAO.findProfileByUserId] Error for userId: ${userId}`, { error });
            throw ERRORS.DB_ERROR(`Failed to find profile: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    /**
     * Finds a main profile by referral code.
     * @param refCode - The referral code to look up.
     * @returns The profile data if found, otherwise null.
     */
    static async findProfileByRefCode(refCode: string) {
        try {
        const profile = await db.query.mainProfiles.findFirst({
            where: eq(mainProfiles.refCode, refCode),
        });
        if (!profile) return null;
        return this.findProfileByUserId(profile.userId);
        } catch (error) {
            logger.error(`[MainProfileDAO.findProfileByRefCode] Error for refCode: ${refCode}`, { error });
            throw ERRORS.DB_ERROR(`Failed to find profile by ref code: ${error instanceof Error ? error.message : "Unknown error"}`);
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
            allProfiles.map(p => this.findProfileByUserId(p.userId as string))
        );
        } catch (error) {
            logger.error(`[MainProfileDAO.findAllProfiles] Error fetching all profiles`, { error });
            throw ERRORS.DB_ERROR(`Failed to find all profiles: ${error instanceof Error ? error.message : "Unknown error"}`);
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
            where: (mainProfiles, { eq }) => eq(mainProfiles.userId, userId),
            with: {
                workerBots: true,
                lootBoxes: true,
                lootBoxesOpened: true,
            },
        });

        if (!profile) return null;

        const {
            workerBots,
            lootBoxes: dbLootBoxes,
            lootBoxesOpened,
            ...profileData
        } = profile;

        return {
            ...profileData,
            game_pass: profile.gamePass,
            worker_bots: workerBots.map(wb => wb.botType),
            lootBoxes: dbLootBoxes.map(lb => lb.boxType),
            lootBoxes_opened: lootBoxesOpened.map(lbo => lbo.count),
        };
        } catch (error) {
            logger.error(`[MainProfileDAO.findProfileByIdFast] Error for userId: ${userId}`, { error });
            throw ERRORS.DB_ERROR(`Failed to find profile (fast): ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
