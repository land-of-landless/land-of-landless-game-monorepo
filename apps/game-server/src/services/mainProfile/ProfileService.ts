import { db } from "@/daos/postgres/connection.js";
import { MainProfileDAO } from "@/daos/postgres/mainProfile.js";
import { MineDAO } from "@/daos/postgres/mine.js";
import { FactoryDAO } from "@/daos/postgres/factory.js";
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
    ENERGY_GENERATOR_UPGRADE_INFO,
} from "@/constants/energyGenerator.js";
import {
    MINE_GENERATION_BASE_RATE,
    MINE_GENERATION_RATE_INCREASE_PER_LEVEL,
    MINE_MINERAL_GENERATION_PER_EXPLORER,
} from "@/constants/mine.js";
import {
    turnTimeInMsToGemsToBePaid,
} from "@/utils/index.js";
import { ERRORS, AppError } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";
import _ from "lodash";

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
        const energyGeneratorProfile = await db.query.energyGenerators.findFirst({
            where: (eg, { eq }) => eq(eg.userId, userId)
        });
        if (!energyGeneratorProfile) return;

        const level = energyGeneratorProfile.level;
        const ratePerPanel = (ENERGY_GENERATOR_UPGRADE_INFO as any)[level]?.energyGenerationRate || 0;
        profile.energy_generation_rate = panelCount * ratePerPanel;

        await MainProfileDAO.saveProfile(profile);
    }

    static async updateMineralGenerationRate(userId: string) {
        const profile = await this.getProfile(userId);
        const mineProfile = await MineDAO.findMineByUserId(userId);
        const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);

        let totalRate = 0;
        if (mineProfile && mineProfile.miners_info) {
            Object.values(mineProfile.miners_info).forEach((miner: any) => {
                if (miner.level > 0) {
                    totalRate += MINE_GENERATION_BASE_RATE + (miner.level - 1) * MINE_GENERATION_RATE_INCREASE_PER_LEVEL;
                }
            });
        }

        if (factoryProfile) {
            totalRate += (factoryProfile.explorers || 0) * MINE_MINERAL_GENERATION_PER_EXPLORER;
        }

        profile.mineral_generation_rate = totalRate;
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

    static async updateEnergyUpdatedAt(userId: string) {
        const profile = await this.getProfile(userId);
        profile.energy_updated_at = new Date().toUTCString();
        await MainProfileDAO.saveProfile(profile);
    }

    static async updateMineralUpdatedAt(userId: string) {
        const profile = await this.getProfile(userId);
        profile.mineral_updated_at = new Date().toUTCString();
        await MainProfileDAO.saveProfile(profile);
    }

    static async chargeEnergy(userId: string, amount: number) {
        const profile = await this.getProfile(userId);
        if (profile.energy < amount) throw ERRORS.VALIDATION("Not enough energy");
        profile.energy -= amount;
        await MainProfileDAO.saveProfile(profile);
    }

    static async addLootBox(userId: string, boxType: any) {
        const profile = await this.getProfile(userId);
        let blankSpot = -1;
        for (let i = 0; i < profile.lootBoxes.length; i++) {
            if (profile.lootBoxes[i] === "") {
                blankSpot = i;
                break;
            }
        }
        if (blankSpot !== -1) {
            profile.lootBoxes[blankSpot] = boxType;
            await MainProfileDAO.saveProfile(profile);
        } else {
            throw ERRORS.VALIDATION("No space for lootbox");
        }
    }

    static async openLootBoxStart(userId: string, boxType: MiniGamesLootBox, position: number) {
        const profile = await this.getProfile(userId);
        if (profile.lootBoxes[position] !== boxType) throw ERRORS.VALIDATION("Incorrect box type at position");

        const timeToWait = (MINI_GAMES_LOOT_BOX_INFO as any)[boxType].timeToOpenInMs;
        profile.lootBoxesTimers[position] = new Date().toUTCString();

        await MainProfileDAO.saveProfile(profile);
        return { startTime: profile.lootBoxesTimers[position] };
    }

    static async openLootBoxEnd(userId: string, position: number) {
        const profile = await this.getProfile(userId);
        const startTimeStr = profile.lootBoxesTimers[position];
        if (!startTimeStr || startTimeStr === "") throw ERRORS.VALIDATION("Loot box not being opened");

        const boxType = profile.lootBoxes[position] as MiniGamesLootBox;
        const timeToWait = (MINI_GAMES_LOOT_BOX_INFO as any)[boxType].timeToOpenInMs;
        const startTime = new Date(startTimeStr);
        const passedTime = Date.now() - startTime.getTime();

        if (passedTime < timeToWait) throw ERRORS.VALIDATION("Not enough time passed");

        profile.lootBoxes[position] = "";
        profile.lootBoxesTimers[position] = "";

        await MainProfileDAO.saveProfile(profile);
        return { success: true };
    }

    static async openLootBoxEndWithGems(userId: string, position: number) {
        const profile = await this.getProfile(userId);
        const startTimeStr = profile.lootBoxesTimers[position];
        if (!startTimeStr || startTimeStr === "") throw ERRORS.VALIDATION("Loot box not being opened");

        const boxType = profile.lootBoxes[position] as MiniGamesLootBox;
        const timeToWait = (MINI_GAMES_LOOT_BOX_INFO as any)[boxType].timeToOpenInMs;
        const startTime = new Date(startTimeStr);
        const passedTime = Date.now() - startTime.getTime();

        const remainingTime = Math.max(0, timeToWait - passedTime);
        const gemsToPay = turnTimeInMsToGemsToBePaid(remainingTime);

        await this.deductGems(userId, gemsToPay);

        profile.lootBoxes[position] = "";
        profile.lootBoxesTimers[position] = "";

        await MainProfileDAO.saveProfile(profile);
        return { success: true };
    }

    static async openLootBoxEndWithKey(userId: string, position: number) {
        const profile = await this.getProfile(userId);
        if (profile.lootBox_keys <= 0) throw ERRORS.VALIDATION("No keys available");

        profile.lootBox_keys -= 1;
        profile.lootBoxes[position] = "";
        profile.lootBoxesTimers[position] = "";

        await MainProfileDAO.saveProfile(profile);
        return { success: true };
    }
}
