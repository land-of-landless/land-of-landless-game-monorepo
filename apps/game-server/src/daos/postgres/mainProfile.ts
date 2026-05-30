import { db } from "./connection.js";
import {
    mainProfiles,
    workerBots,
    lootBoxes,
    lootBoxesOpened,
} from "../../models/postgres/schema.js";
import { eq } from "drizzle-orm";
import { MainProfile } from "../../models/redis/mainProfile.js";

export class MainProfilePostgresDAO {
    static async createProfile(profileData: any) {
        return await db.transaction(async (tx) => {
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
                atmosphereTrashUpdatedAt: profileData.atmosphere_trash_updated_at
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
                    })),
                );
            }

            if (profileData.lootBoxes?.length > 0) {
                await tx.insert(lootBoxes).values(
                    profileData.lootBoxes.map((boxType: any, index: number) => ({
                        userId: profileData.userId,
                        boxType,
                        timer: profileData.lootBoxesTimers[index]
                            ? new Date(profileData.lootBoxesTimers[index])
                            : null,
                        position: index,
                    })),
                );
            }

            if (profileData.lootBoxes_opened?.length > 0) {
                await tx.insert(lootBoxesOpened).values(
                    profileData.lootBoxes_opened.map(
                        (count: number, index: number) => ({
                            userId: profileData.userId,
                            boxTypeIndex: index,
                            count,
                        }),
                    ),
                );
            }

            return profileData;
        });
    }

    static async saveProfile(profile: any) {
        return await db.transaction(async (tx) => {
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
                    atmosphereTrashUpdatedAt: profile.atmosphere_trash_updated_at
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
            await tx.delete(workerBots).where(eq(workerBots.userId, profile.userId));
            if (profile.worker_bots?.length > 0) {
                await tx.insert(workerBots).values(
                    profile.worker_bots.map((botType: any) => ({
                        userId: profile.userId,
                        botType,
                    })),
                );
            }

            // Update loot boxes
            await tx.delete(lootBoxes).where(eq(lootBoxes.userId, profile.userId));
            if (profile.lootBoxes?.length > 0) {
                await tx.insert(lootBoxes).values(
                    profile.lootBoxes.map((boxType: any, index: number) => ({
                        userId: profile.userId,
                        boxType,
                        timer: profile.lootBoxesTimers?.[index]
                            ? new Date(profile.lootBoxesTimers[index])
                            : null,
                        position: index,
                    })),
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
                        }),
                    ),
                );
            }

            return profile;
        });
    }

    static async findProfileByUserId(userId: string) {
        const profile = await db.query.mainProfiles.findFirst({
            where: eq(mainProfiles.userId, userId),
            with: {
                workerBots: true,
                lootBoxes: {
                    orderBy: (lootBoxes, { asc }) => [asc(lootBoxes.position)],
                },
                lootBoxesOpened: {
                    orderBy: (lootBoxesOpened, { asc }) => [
                        asc(lootBoxesOpened.boxTypeIndex),
                    ],
                },
            },
        });

        if (!profile) return null;

        // Map back to Redis-like structure if needed, or return as is
        return {
            ...profile,
            userId: profile.userId,
            game_pass: profile.gamePass,
            game_pass_purchase_time: profile.gamePassPurchaseTime?.toISOString(),
            worker_bots: profile.workerBots.map((b) => b.botType),
            lootBoxes: profile.lootBoxes.map((b) => b.boxType),
            lootBoxesTimers: profile.lootBoxes.map(
                (b) => b.timer?.toISOString() || "",
            ),
            lootBox_keys: profile.lootBoxKeys,
            lootBoxes_opened: profile.lootBoxesOpened.map((b) => b.count),
            energy_generation_rate: profile.energyGenerationRate,
            energy_max: profile.energyMax,
            energy_updated_at: profile.energyUpdatedAt?.toISOString(),
            mineral_generation_rate: profile.mineralGenerationRate,
            mineral_max: profile.mineralMax,
            mineral_updated_at: profile.mineralUpdatedAt?.toISOString(),
            atmosphere_trash_type1: profile.atmosphereTrashType1,
            atmosphere_trash_type2: profile.atmosphereTrashType2,
            atmosphere_trash_updated_at:
                profile.atmosphereTrashUpdatedAt?.toISOString(),
            lastDailyRewardClaimedAt: profile.lastDailyRewardClaimedAt?.toISOString(),
        };
    }

    static async findProfileByRefCode(refCode: string) {
        const profile = await db.query.mainProfiles.findFirst({
            where: eq(mainProfiles.refCode, refCode),
        });
        if (!profile) return null;
        return this.findProfileByUserId(profile.userId as string);
    }

    static async findAllProfiles() {
        const allProfiles = await db.query.mainProfiles.findMany();
        // This is expensive if we fetch relations for all, but for migration purposes:
        return Promise.all(
            allProfiles.map((p) => this.findProfileByUserId(p.userId as string)),
        );
    }

    /**
     * Finds a user profile by their user ID using Relational Query API for performance.
     * @param userId - The ID of the user.
     * @returns The MainProfile entity if found, otherwise null.
     */
    static async findProfileByIdFast(userId: string) {
        const profile = await db.query.mainProfiles.findFirst({
            where: (mainProfiles, { eq }) => eq(mainProfiles.userId, userId),
            with: {
                workerBots: true,
                lootBoxes: true,
                lootBoxesOpened: true,
            },
        });

        if (!profile) return null;

        return {
            ...profile,
            game_pass: profile.gamePass,
            worker_bots: profile.workerBots.map((wb) => wb.botType),
            lootBoxes: profile.lootBoxes.map((lb) => lb.boxType),
            lootBoxes_opened: profile.lootBoxesOpened.map((lbo) => lbo.count),
        };
    }
}
