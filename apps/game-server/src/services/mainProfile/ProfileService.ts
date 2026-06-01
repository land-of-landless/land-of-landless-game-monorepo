import { db } from "@/daos/postgres/connection.js";
import { MainProfileDAO } from "@/daos/postgres/mainProfile.js";
import { MineDAO } from "@/daos/postgres/mine.js";
import { FactoryDAO } from "@/daos/postgres/factory.js";
import { redisFastClient } from "@/daos/redis/connectRedis/fast.js";
import {
    DAILY_REWARD_COOLDOWN_HOURS,
    DAILY_CLAIM_REWARDS,
    DAILY_REWARD_MAX_CONSECUTIVE_HOURS,
    DailyRewardsClaimKey,
    DAILY_REWARD_RESET_CYCLE_DAYS,
    PROFILE_MAX_NUM_OF_TRASH_TYPE_1,
    PROFILE_MAX_NUM_OF_TRASH_TYPE_2,
} from "@/constants/mainProfile.js";
import {
    MINI_GAMES_LOOT_BOX_INFO,
    MiniGamesLootBox,
} from "@/constants/miniGames.ts";
import {
    turnTimeInMsToGemsToBePaid,
} from "@/utils/index.js";
import { ERRORS, AppError } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";
import _ from "lodash";
import { eq } from "drizzle-orm";
import { mainProfiles } from "@/models/postgres/schema.js";

export default class ProfileService {
    static async getProfile(userId: string): Promise<any> {
        const profile = await MainProfileDAO.findProfileByUserId(userId);
        if (!profile) {
            throw ERRORS.NOT_FOUND("Profile not found");
        }
        return profile;
    }

    static async findProfileByRefCode(refCode: string): Promise<any> {
        return await MainProfileDAO.findProfileByRefCode(refCode);
    }

    static async saveProfile(profile: any): Promise<any> {
        return await MainProfileDAO.saveProfile(profile);
    }

    static async createProfile(profileData: any): Promise<any> {
        return await MainProfileDAO.createProfile(profileData);
    }

    static async saveProfilesAtomic(profiles: any[]): Promise<void> {
        await db.transaction(async (tx) => {
            for (const profile of profiles) {
                await MainProfileDAO.saveProfile(profile);
            }
        });
    }

    static async updatePreferences(
        userId: string,
        name?: string,
        profilePictureIndex?: number
    ): Promise<any> {
        const profile = await this.getProfile(userId);
        if (name !== undefined) profile.name = name;
        if (profilePictureIndex !== undefined)
            profile.profilePictureIndex = profilePictureIndex;
        await MainProfileDAO.saveProfile(profile);
        return profile;
    }

    static async updateEnergyGenerationRate(userId: string, panelCount: number) {
        const profile = await this.getProfile(userId);
        await MainProfileDAO.saveProfile(profile);
    }

    static async updateMineralGenerationRate(userId: string) {
        const profile = await this.getProfile(userId);
        await MainProfileDAO.saveProfile(profile);
    }

    static async deductCoins(userId: string, coins: number) {
        const profile = await this.getProfile(userId);
        if (profile.coins < coins) throw ERRORS.VALIDATION("Not enough coins");
        profile.coins -= coins;
        await MainProfileDAO.saveProfile(profile);
        return profile;
    }

    static async deductGems(userId: string, gems: number) {
        const profile = await this.getProfile(userId);
        if (profile.gems < gems) throw ERRORS.VALIDATION("Not enough gems");
        profile.gems -= gems;
        await MainProfileDAO.saveProfile(profile);
        return profile;
    }

    static async deductMineral(userId: string, mineral: number) {
        const profile = await this.getProfile(userId);
        if (profile.mineral < mineral) throw ERRORS.VALIDATION("Not enough mineral");
        profile.mineral -= mineral;
        await MainProfileDAO.saveProfile(profile);
        return profile;
    }

    static async deductMineralAndCoin(userId: string, mineral: number, coins: number) {
        const profile = await this.getProfile(userId);
        if (profile.mineral < mineral) throw ERRORS.VALIDATION("Not enough mineral");
        if (profile.coins < coins) throw ERRORS.VALIDATION("Not enough coins");
        profile.mineral -= mineral;
        profile.coins -= coins;
        await MainProfileDAO.saveProfile(profile);
        return profile;
    }

    static async deductAtmosphereAstroid(userId: string) {
        const profile = await this.getProfile(userId);
        if (profile.atmosphere_trash_type2 <= 0) throw ERRORS.VALIDATION("No astroid");
        profile.atmosphere_trash_type2 -= 1;
        await MainProfileDAO.saveProfile(profile);
        return profile;
    }

    static async updateEnergyUpdatedAt(userId: string) {}
    static async updateMineralUpdatedAt(userId: string) {}
    static async openLootBoxStart(userId: string, boxType: any, position: number) { return {} as any; }
    static async openLootBoxEnd(userId: string, position: number) { return {} as any; }
    static async openLootBoxEndWithGems(userId: string, position: number) { return {} as any; }
    static async openLootBoxEndWithKey(userId: string, position: number) { return {} as any; }
    static async chargeEnergy(userId: string, amount: number) {}
    static async addLootBox(userId: string, boxType: any) {}
}
