import MainProfileDAO from "@/daos/redis/mainProfile";
import { MainProfile } from "@/models/redis/mainProfile";
import { MineDAO } from "@/daos/redis/mine"; // Keep this import if used elsewhere
import { FactoryDAO } from "@/daos/redis/factory";
import { mainProfileRepository } from "@/daos/redis/repositories/index";
import { ERRORS, AppError } from "@/common/errors/appError";
import _ from "lodash";
import {
    BASE_REWARDS,
    GEMS_PER_MINUTE,
    LootBoxRewards,
} from "@/constants/mainProfile";
import {
    ENERGY_GENERATOR_BASE_ENERGY_GENERATION_RATE,
    ENERGY_GENERATOR_INCREASE_PER_PANEL,
    ENERGY_GENERATOR_MAX_ENERGY_GENERATION_RATE,
} from "@/constants/energyGenerator";
import {
    MINE_MAX_MINER_COUNT,
    MINE_MAX_MINERAL_GENERATION_RATE,
    MINE_UPGRADE_INFO,
    MINE_MINERAL_GENERATION_PER_EXPLORER,
    MineUpgradeLevel,
} from "@/constants/mine";
import {
    MINI_GAMES_INFO,
    MINI_GAMES_LOOT_BOX_INFO,
    MiniGamesKey,
    MiniGamesLootBox,
} from "@/constants/miniGames";
import logger from "@/utils/logger"; // Keep this import if used elsewhere
import { checkValForProfanity } from "@/utils/profanity"; // Keep this import if used elsewhere
import { redisFastClient } from "@/daos/redis/connectRedis/fast.ts";

export interface OpenLootBoxStartResult {
    profile: MainProfile;
    startToOpenTime: string;
    targetLootBox: string;
}

// Reusing OpenLootBoxEndResult as the structure is identical
// export interface OpenLootBoxEndWithGemsResult {
//     profile: MainProfile;
//     rewards: LootBoxRewards;
// }
export interface OpenLootBoxEndResult {
    profile: MainProfile;
    rewards: LootBoxRewards;
}

export default class ProfileService {
    /**
     * Calculates the gem cost based on remaining time in milliseconds.
     * @param remainingTimeMs - The remaining time in milliseconds.
     * @returns The calculated gem cost.
     */
    private static calculateGemCostForTime(remainingTimeMs: number): number {
        return Math.floor((remainingTimeMs / 1000 / 60) * GEMS_PER_MINUTE);
    }

    /**
     * Retrieves the user's profile.
     */
    static async getProfile(userId: string) {
        const userProfile = await MainProfileDAO.findProfileByUserId(userId);
        if (!userProfile) {
            throw ERRORS.NOT_FOUND("MainProfile not found");
        }
        return userProfile;
    }

    /**
     * Finds a user profile by their unique referral code.
     */
    static async findProfileByRefCode(refCode: string) {
        return await MainProfileDAO.findProfileByRefCode(refCode);
    }

    /**
     * Saves a user profile.
     */
    static async saveProfile(profile: MainProfile) {
        return await MainProfileDAO.saveProfile(profile);
    }

    /**
     * Creates a new user profile.
     */
    static async createProfile(profileData: MainProfile) {
        return await MainProfileDAO.createProfile(profileData);
    }

    /**
     * Saves multiple user profiles atomically using a Redis transaction.
     * @param profiles - An array of MainProfile instances to save.
     */
    static async saveProfilesAtomic(profiles: MainProfile[]): Promise<void> {
        const multi = redisFastClient.multi();

        for (const profile of profiles) {
            // Assuming MainProfileDAO.saveProfile internally uses `mainProfileRepository.save`
            // and that `mainProfileRepository.save` uses `HSET` or similar.
            // To make it atomic, we need to queue the raw Redis commands.
            // This requires knowledge of how MainProfileDAO serializes and stores the profile.
            // For Redis OM, `repository.save()` typically serializes the entity.
            // A direct `HSET` would be: multi.hSet(profile.key, profile.data);
            // For simplicity and to reuse existing serialization, we'll queue the save operation.
            // NOTE: This assumes `mainProfileRepository.save` can be queued in a multi.
            multi.json.set(profile.userId, "$", profile); // Assuming JSON.SET is used for MainProfile
        }
        await multi.exec(); // Execute all commands atomically
    }

    /**
     * Updates the user's profile preferences (name and/or profile picture).
     * @param userId - The ID of the user.
     * @param name - The new name to set (optional).
     * @param profilePictureIndex - The new profile picture index to set (optional).
     * @returns The updated profile.
     */
    static async updatePreferences(
        userId: string,
        name?: string,
        profilePictureIndex?: number,
        representedFlag?: string
    ) {
        try {
            const userProfile =
                await MainProfileDAO.findProfileByUserId(userId);

            if (!userProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            let isDirty = false;

            // only update preferences if they are introduced and changing
            if (
                name !== undefined &&
                name !== null &&
                userProfile.name !== name
            ) {
                const hasProfanity = await checkValForProfanity(name, [
                    "SimpleFilter",
                    "ProfanityDev",
                ]);

                if (hasProfanity) {
                    throw ERRORS.FORBIDDEN("provided name contains profanity");
                }

                userProfile.name = name;
                isDirty = true;
            }

            if (
                profilePictureIndex !== undefined &&
                profilePictureIndex !== null &&
                userProfile.profilePictureIndex !== profilePictureIndex
            ) {
                // End of Rate Limiting Logic (PFP)
                userProfile.profilePictureIndex = profilePictureIndex;
                isDirty = true;
            }

            if (
                representedFlag !== undefined &&
                representedFlag !== null &&
                userProfile.representedFlag !== representedFlag
            ) {
                userProfile.representedFlag = representedFlag;
                isDirty = true;
            }

            if (isDirty) {
                await mainProfileRepository.save(userProfile);
            }

            return userProfile;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to update profile preferences: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * Generates randomized rewards for a loot box based on its type.
     * @param lootBoxType - The type of the loot box (1-4), which determines the reward multiplier.
     * @returns An object containing the calculated rewards (coins, gems, xp, etc.).
     */
    private static generateLootBoxRewards(
        lootBoxType: MiniGamesLootBox
    ): LootBoxRewards {
        const baseRewards = BASE_REWARDS;

        // Higher loot box types have a higher reward multiplier.
        let multiplier = 1;

        switch (lootBoxType) {
            case "common":
                multiplier = 1;
                break;
            case "uncommon":
                multiplier = 3;
                break;
            case "rare":
                multiplier = 10;
                break;
            case "epic":
                multiplier = 40;
                break;
            case "legendary":
                multiplier = 60;
                break;
            case "custom":
                // do sth
                break;
            default:
                throw ERRORS.VALIDATION("Invalid loot box type");
        }

        // A helper function to add some randomness to the rewards.
        const randomFactor = (min: number, max: number) => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        // Calculate each reward type based on the base amount, multiplier, and random factor.
        return {
            coins: Math.floor(
                baseRewards.coins * multiplier +
                    randomFactor(
                        -(baseRewards.coins * multiplier) / 2,
                        (baseRewards.coins * multiplier) / 2
                    )
            ),
            gems: Math.floor(
                baseRewards.gems * multiplier +
                    randomFactor(
                        -(baseRewards.gems * multiplier) / 2,
                        (baseRewards.gems * multiplier) / 2
                    )
            ),
            xp: Math.floor(
                baseRewards.xp * multiplier +
                    randomFactor(
                        -(baseRewards.xp * multiplier) / 2,
                        (baseRewards.xp * multiplier) / 2
                    )
            ),
            tickets: Math.floor(
                baseRewards.tickets * multiplier +
                    randomFactor(
                        -(baseRewards.tickets * multiplier) / 2,
                        (baseRewards.tickets * multiplier) / 2
                    )
            ),

            lootBoxKeys:
                lootBoxType === "epic" || lootBoxType === "legendary" ? 1 : 0,
        };
    }

    /**
     * Applies loot box rewards to a user profile and updates statistics.
     * @param profile - The user profile document to update.
     * @param lootBoxType - The type of loot box being opened.
     * @returns The updated profile document.
     */
    private static applyLootBoxRewards(
        profile: MainProfile,
        lootBoxType: MiniGamesLootBox
    ): {
        profile: MainProfile;
        rewards: LootBoxRewards;
    } {
        const rewards = this.generateLootBoxRewards(lootBoxType);

        // Apply rewards to profile
        profile.coins += rewards.coins;
        profile.gems += rewards.gems;
        profile.xp += rewards.xp;
        profile.tickets_type2 += rewards.tickets;
        profile.lootBox_keys += rewards.lootBoxKeys;

        // Update statistics for the number of opened boxes of this type
        const lootBoxInfo = MINI_GAMES_LOOT_BOX_INFO[lootBoxType];
        if (lootBoxInfo) {
            profile.lootBoxes_opened[lootBoxInfo.numericalId - 1] += 1;
        }

        return { profile, rewards };
    }

    /**
     * Starts opening a loot box.
     * @param userId - The ID of the user.
     * @param lootBoxIndex - The index of the loot box in the user's inventory.
     * @returns An object containing the start time.
     */
    static async openLootBoxStart(
        userId: string,
        lootBoxIndex: number
    ): Promise<OpenLootBoxStartResult> {
        try {
            const profile = await this.getProfile(userId);

            // --- Validation Checks ---
            const targetLootBox = profile.lootBoxes[lootBoxIndex];

            // Ensure there is a loot box at the specified index.
            if (targetLootBox === "" || _.isNil(targetLootBox)) {
                throw ERRORS.NOT_FOUND("Loot box not found");
            }

            // Ensure the loot box is not already being opened.
            if (profile.lootBoxesTimers[lootBoxIndex] !== "") {
                throw ERRORS.VALIDATION("Loot box already opened");
            }

            // --- Worker Bot Availability Check ---
            const activeWorkers = profile.worker_bots.filter(
                (robot: number) => robot === 1
            ).length;
            const activeTimers = profile.lootBoxesTimers.filter(
                (timer: string) => timer !== ""
            ).length;

            // The user must have a free worker bot to start opening a new box.
            if (activeTimers >= activeWorkers) {
                throw ERRORS.VALIDATION("Not enough worker robots");
            }

            const startTime = new Date().toUTCString();
            profile.lootBoxesTimers[lootBoxIndex] = startTime;

            await mainProfileRepository.save(profile);

            return {
                profile,
                startToOpenTime: startTime,
                targetLootBox,
            };
        } catch (error: any) {
            if (error instanceof AppError) throw error;

            logger.error(
                `[ProfileService.openLootBoxStart] Error for userId: ${userId}`,
                { error }
            );

            throw ERRORS.DB_ERROR(
                `Failed to open lootbox: ${error.message || "Unknown error"}`
            );
        }
    }

    /**
     * Finalizes the process of opening a loot box after the timer has completed.
     * @param userId - The ID of the user.
     * @param lootBoxIndex - The index of the loot box.
     * @returns The rewards generated from the loot box.
     */
    static async openLootBoxEnd(
        userId: string,
        lootBoxIndex: number
    ): Promise<OpenLootBoxEndResult> {
        try {
            const profile = await this.getProfile(userId);

            // --- Validation Checks ---
            const targetLootBox = profile.lootBoxes[lootBoxIndex];

            // Ensure there is a loot box at the specified index.
            if (targetLootBox === "" || _.isNil(targetLootBox)) {
                throw ERRORS.NOT_FOUND("Loot box not found");
            }

            // Ensure the loot box has a timer running.
            if (profile.lootBoxesTimers[lootBoxIndex] === "") {
                throw ERRORS.VALIDATION("Loot box already opened");
            }

            // --- Timer Check ---
            // Calculate the time elapsed since the opening process started.
            const now = new Date().getTime();
            const lootBoxStartToOpenTime = new Date(
                profile.lootBoxesTimers[lootBoxIndex]
            ).getTime();
            const passedTimeSoFar = now - lootBoxStartToOpenTime;

            // The elapsed time should not be negative.
            if (passedTimeSoFar < 0) {
                throw ERRORS.VALIDATION("Invalid time");
            }

            const expectedTimeToPass =
                MINI_GAMES_LOOT_BOX_INFO[targetLootBox].timeToOpenInMs /
                profile.lootBoxesOpeningRate;

            // Ensure enough time has passed to complete the opening.
            if (passedTimeSoFar < expectedTimeToPass) {
                throw ERRORS.VALIDATION("Not enough time passed");
            }

            // --- Apply Rewards and Update MainProfile ---
            const { rewards } = this.applyLootBoxRewards(
                profile,
                targetLootBox
            );

            // Reset the loot box slot to make it available again.
            profile.lootBoxesTimers[lootBoxIndex] = "";
            profile.lootBoxes[lootBoxIndex] = "";

            await mainProfileRepository.save(profile);

            return { rewards, profile };
        } catch (error: any) {
            if (error instanceof AppError) throw error;

            logger.error(
                `[ProfileService.openLootBoxEnd] Error for userId: ${userId}`,
                { error }
            );

            throw ERRORS.DB_ERROR(
                `Failed to end opening lootbox: ${error.message || "Unknown error"}`
            );
        }
    }

    /**
     * Instantly opens a loot box using gems to skip the remaining time.
     * @param userId - The ID of the user.
     * @param lootBoxIndex - The index of the loot box.
     * @returns The updated profile.
     */
    static async openLootBoxEndWithGems(
        userId: string,
        lootBoxIndex: number
    ): Promise<OpenLootBoxEndResult> {
        try {
            const profile = await this.getProfile(userId);

            // --- Validation Checks ---
            const targetLootBox = profile.lootBoxes[lootBoxIndex];

            // Ensure there is a loot box at the specified index.
            if (targetLootBox === "" || _.isNil(targetLootBox)) {
                throw ERRORS.NOT_FOUND("Loot box not found");
            }

            // Ensure the loot box has a timer running.
            if (profile.lootBoxesTimers[lootBoxIndex] === "") {
                throw ERRORS.VALIDATION("Loot box already opened");
            }

            // --- Gem Cost Calculation ---
            // Calculate the remaining time on the loot box timer.
            const now = new Date().getTime();
            const lootBoxStartToOpenTime = new Date(
                profile.lootBoxesTimers[lootBoxIndex]
            ).getTime();
            const targetTime =
                lootBoxStartToOpenTime +
                MINI_GAMES_LOOT_BOX_INFO[targetLootBox].timeToOpenInMs;
            const remainingTime = Math.floor(
                (targetTime - now) / profile.lootBoxesOpeningRate
            );

            // If the timer is already finished, this method should not be used.
            if (remainingTime <= 0) {
                throw ERRORS.VALIDATION("Invalid time");
            }
            // Convert the remaining time into the equivalent cost in gems.
            const expectedGemsToOpen =
                this.calculateGemCostForTime(remainingTime);

            // A minimum of 1 gem is required.
            if (expectedGemsToOpen < 1) {
                throw ERRORS.VALIDATION("Not possible!");
            }
            // Check if the user has enough gems to pay.
            if (expectedGemsToOpen > profile.gems) {
                throw ERRORS.VALIDATION("Not enough gems");
            }

            // --- Apply Rewards and Update MainProfile ---
            profile.gems -= expectedGemsToOpen;

            const { rewards } = this.applyLootBoxRewards(
                profile,
                targetLootBox
            );
            // Update statistics for the number of opened boxes of this type.
            profile.lootBoxes_opened[
                MINI_GAMES_LOOT_BOX_INFO[targetLootBox].numericalId - 1
            ] += 1;

            // Reset the loot box slot to make it available again.
            profile.lootBoxesTimers[lootBoxIndex] = "";
            profile.lootBoxes[lootBoxIndex] = "";

            await mainProfileRepository.save(profile);
            return { profile, rewards };
        } catch (error: any) {
            if (error instanceof AppError) throw error;

            logger.error(
                `[ProfileService.openLootBoxEndWithGems] Error for userId: ${userId}`,
                { error }
            );

            throw ERRORS.DB_ERROR(
                `Failed to open lootbox with gems: ${error.message || "Unknown error"}`
            );
        }
    }

    /**
     * Instantly opens a loot box using a key, bypassing the timer.
     * @param userId - The ID of the user.
     * @param lootBoxIndex - The index of the loot box.
     * @returns The rewards generated from the loot box.
     */
    static async openLootBoxEndWithKey(
        userId: string,
        lootBoxIndex: number
    ): Promise<OpenLootBoxEndResult> {
        try {
            const profile = await this.getProfile(userId);

            // --- Validation Checks ---
            const targetLootBox = profile.lootBoxes[lootBoxIndex];

            // Ensure there is a loot box at the specified index.
            if (targetLootBox === "" || _.isNil(targetLootBox)) {
                throw ERRORS.NOT_FOUND("Loot box not found");
            }

            // This check might be redundant if keys can open boxes that haven't started opening.
            if (profile.lootBoxesTimers[lootBoxIndex] === "") {
                throw ERRORS.VALIDATION("Loot box already opened");
            }

            // Ensure the user has a key to spend.
            if (profile.lootBox_keys <= 0) {
                throw ERRORS.VALIDATION("No key found");
            }

            // Deduct one key from the user's inventory.
            profile.lootBox_keys -= 1;

            const { rewards } = this.applyLootBoxRewards(
                profile,
                targetLootBox
            );

            // Update statistics for the number of opened boxes of this type.
            profile.lootBoxes_opened[
                MINI_GAMES_LOOT_BOX_INFO[targetLootBox].numericalId - 1
            ] += 1;

            // Reset the loot box slot to make it available again.
            profile.lootBoxesTimers[lootBoxIndex] = "";
            profile.lootBoxes[lootBoxIndex] = "";
            await mainProfileRepository.save(profile);

            return { rewards, profile };
        } catch (error: any) {
            if (error instanceof AppError) throw error;

            logger.error(
                `[ProfileService.openLootBoxEndWithKey] Error for userId: ${userId}`,
                { error }
            );

            throw ERRORS.DB_ERROR(
                `Failed to open lootbox with key: ${error.message || "Unknown error"}`
            );
        }
    }

    /**
     * Adds a new loot box to the first available empty slot in the user's inventory.
     * @param userId - The ID of the user.
     * @param lootBoxType - The type of loot box to add.
     * @returns The updated profile.
     */
    static async addLootBox(
        userId: string,
        lootBoxType: MiniGamesLootBox,
        softAdd?: boolean
    ) {
        try {
            const userProfile =
                await MainProfileDAO.findProfileByUserId(userId);

            if (!userProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            // Find the first empty loot box slot (represented by 0).
            const emptySlotIndex = userProfile.lootBoxes.findIndex(
                (slot: MiniGamesLootBox | "") => slot === ""
            );

            // If no empty slot is found, throw an error.
            // except if softAdd is true, just skip and don't throw error
            if (emptySlotIndex === -1) {
                if (!softAdd) {
                    throw ERRORS.VALIDATION("No empty loot box slots");
                }
                return;
            }

            // Place the new loot box in the empty slot.
            userProfile.lootBoxes[emptySlotIndex] = lootBoxType;

            return await mainProfileRepository.save(userProfile);
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[ProfileService.addLootBox] Error for userId: ${userId}`,
                {
                    error,
                }
            );
            throw ERRORS.DB_ERROR(
                `Failed to add loot box: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * Updates the user's energy generation rate based on the number of new panels added.
     */
    static async updateEnergyGenerationRate(
        userId: string,
        newPanelCount: number
    ) {
        try {
            let userProfile = await MainProfileDAO.findProfileByUserId(userId);

            if (!userProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            // Calculate the new energy generation rate.
            let newEnergyGenerationRate =
                ENERGY_GENERATOR_BASE_ENERGY_GENERATION_RATE +
                newPanelCount * ENERGY_GENERATOR_INCREASE_PER_PANEL;

            // Ensure the new rate does not exceed the maximum allowed.
            if (
                newEnergyGenerationRate >
                ENERGY_GENERATOR_MAX_ENERGY_GENERATION_RATE
            ) {
                newEnergyGenerationRate =
                    ENERGY_GENERATOR_MAX_ENERGY_GENERATION_RATE;
            }

            // Update the user's profile with the new rate.
            userProfile.energy_generation_rate = newEnergyGenerationRate;
            return await mainProfileRepository.save(userProfile);
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to update energy generation rate: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * Deducts the energy cost for starting a game.
     */
    static async chargeEnergy(userId: string, gameKey: MiniGamesKey) {
        try {
            const userProfile =
                await MainProfileDAO.findProfileByUserId(userId);

            if (!userProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            const gameInfo = MINI_GAMES_INFO[gameKey];

            if (!gameInfo) {
                throw ERRORS.VALIDATION("Invalid mini game id");
            }

            // Ensure the user has enough energy.
            if (userProfile.energy < gameInfo.energy) {
                throw ERRORS.VALIDATION("Not enough energy");
            }

            // Deduct the energy and save the updated profile.
            userProfile.energy -= gameInfo.energy;
            await mainProfileRepository.save(userProfile);
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to charge energy: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * Calculates and applies the amount of energy generated since the last update.
     */
    static async updateEnergyUpdatedAt(userId: string) {
        try {
            const fetchedUserProfile =
                await MainProfileDAO.findProfileByUserId(userId);
            if (!fetchedUserProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            // Calculate time passed since the last energy update.
            let now = new Date();
            let previousUpdatedAt = new Date(
                fetchedUserProfile.energy_updated_at
            );
            let passedTime = now.getTime() - previousUpdatedAt.getTime();

            if (passedTime < 0) {
                throw ERRORS.VALIDATION("Invalid time");
            }

            // Calculate the amount of energy generated during the elapsed time.
            let generatedEnergy = Math.floor(
                (passedTime / 1000 / 60 / 60) *
                    fetchedUserProfile.energy_generation_rate
            );

            // Add the generated energy, ensuring it does not exceed the maximum capacity.
            let newEnergy = Math.min(
                fetchedUserProfile.energy_max,
                fetchedUserProfile.energy + generatedEnergy
            );

            // Calculate the new timestamp.
            let newEnergyUpdatedAt = new Date(
                previousUpdatedAt.getTime() +
                    Math.floor(
                        (generatedEnergy * 1000 * 60 * 60) /
                            fetchedUserProfile.energy_generation_rate
                    )
            );

            // Apply the updates to the profile.
            fetchedUserProfile.energy = newEnergy;
            fetchedUserProfile.energy_updated_at =
                newEnergyUpdatedAt.toUTCString();

            await mainProfileRepository.save(fetchedUserProfile);

            return {
                energy: fetchedUserProfile.energy,
                energy_updated_at: fetchedUserProfile.energy_updated_at,
            };
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to update energy: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * Updates the user's mineral generation rate based on their mine levels.
     */
    static async updateMineralGenerationRate(userId: string) {
        try {
            let userProfile = await MainProfileDAO.findProfileByUserId(userId);

            if (!userProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            let factoryProfile = await FactoryDAO.findFactoryByUserId(userId);

            if (!factoryProfile) {
                throw ERRORS.NOT_FOUND("factory profile not found");
            }

            // Fetch the corresponding mine profile to get miner levels.
            const mineProfile = await MineDAO.findMineByUserId(userId);

            if (!mineProfile) {
                throw ERRORS.NOT_FOUND("Mine profile not found");
            }

            let fetched_miners_info = mineProfile.miners_info;

            // Sum the generation rates from each individual miner based on its level.
            let mineralGenerationRateFromMines = 0;
            for (let i = 1; i <= MINE_MAX_MINER_COUNT; i++) {
                let minerInfoKey = `miner${i}` as
                    | "miner1"
                    | "miner2"
                    | "miner3";
                let currentLevel = fetched_miners_info[minerInfoKey].level as
                    | MineUpgradeLevel
                    | 0;
                if (currentLevel === 0) {
                    continue;
                }
                mineralGenerationRateFromMines +=
                    MINE_UPGRADE_INFO[currentLevel].energyGenerationRate;
            }

            // total energy generation coming from explores
            let totalEnergyGenerationFromMines =
                factoryProfile.explorers * MINE_MINERAL_GENERATION_PER_EXPLORER;

            let newMineralGenerationRate =
                mineralGenerationRateFromMines + totalEnergyGenerationFromMines;

            if (
                newMineralGenerationRate < 0 ||
                newMineralGenerationRate > MINE_MAX_MINERAL_GENERATION_RATE
            ) {
                throw ERRORS.VALIDATION("Invalid mineral generation rate");
            }

            userProfile.mineral_generation_rate = newMineralGenerationRate;
            return await mainProfileRepository.save(userProfile);
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to update mineral generation rate: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * Calculates and applies the amount of minerals generated since the last update.
     */
    static async updateMineralUpdatedAt(userId: string) {
        try {
            const fetchedUserProfile =
                await MainProfileDAO.findProfileByUserId(userId);
            if (!fetchedUserProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            // Calculate time passed since the last mineral update.
            let now = new Date();
            let previousUpdatedAt = new Date(
                fetchedUserProfile.mineral_updated_at
            );
            let passedTime = now.getTime() - previousUpdatedAt.getTime();

            if (passedTime < 0) {
                throw ERRORS.VALIDATION("Invalid time");
            }

            // Calculate the amount of minerals generated during the elapsed time.
            let generatedMineral = Math.floor(
                (passedTime / 1000 / 60 / 60) *
                    fetchedUserProfile.mineral_generation_rate
            );

            // Add the generated minerals, ensuring it does not exceed the maximum capacity.
            let newMineral = Math.min(
                fetchedUserProfile.mineral_max,
                fetchedUserProfile.mineral + generatedMineral
            );

            // Calculate the new timestamp.
            let newMineralUpdatedAt = new Date(
                previousUpdatedAt.getTime() +
                    Math.floor(
                        (generatedMineral * 1000 * 60 * 60) /
                            fetchedUserProfile.mineral_generation_rate
                    )
            );

            // Apply the updates to the profile.
            fetchedUserProfile.mineral = newMineral;
            fetchedUserProfile.mineral_updated_at =
                newMineralUpdatedAt.toUTCString();

            await mainProfileRepository.save(fetchedUserProfile);
            return {
                mineral: fetchedUserProfile.mineral,
                mineral_updated_at: fetchedUserProfile.mineral_updated_at,
            };
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to update mineral: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * Atomically deducts a combination of resources (coins, gems, or mineral) from a user's profile.
     * This method provides a flexible way to handle single or multiple deductions using explicit case logic.
     * @param userId - The ID of the user.
     * @param amounts - An object containing the amounts of each resource to deduct.
     * @returns The updated profile.
     */
    static async deductResources(
        userId: string,
        amounts: {
            coins?: number;
            gems?: number;
            mineral?: number;
            atmosphere_trash_type2?: number;
        }
    ): Promise<MainProfile> {
        try {
            const profile = await this.getProfile(userId);

            // --- Phase 1: Validation ---
            // Validate all resource balances before making any changes to ensure atomicity
            if (amounts.coins !== undefined && amounts.coins > 0) {
                if (profile.coins < amounts.coins)
                    throw ERRORS.VALIDATION("Not enough coins");
            }
            if (amounts.gems !== undefined && amounts.gems > 0) {
                if (profile.gems < amounts.gems)
                    throw ERRORS.VALIDATION("Not enough gems");
            }
            if (amounts.mineral !== undefined && amounts.mineral > 0) {
                if (profile.mineral < amounts.mineral)
                    throw ERRORS.VALIDATION("Not enough minerals");
            }
            if (
                amounts.atmosphere_trash_type2 !== undefined &&
                amounts.atmosphere_trash_type2 > 0
            ) {
                if (
                    profile.atmosphere_trash_type2 <
                    amounts.atmosphere_trash_type2
                )
                    throw ERRORS.VALIDATION("Not enough atmosphere trash");
            }

            // --- Phase 2: Execution ---
            if (amounts.coins && amounts.coins > 0)
                profile.coins -= amounts.coins;
            if (amounts.gems && amounts.gems > 0) profile.gems -= amounts.gems;
            if (amounts.mineral && amounts.mineral > 0)
                profile.mineral -= amounts.mineral;
            if (
                amounts.atmosphere_trash_type2 &&
                amounts.atmosphere_trash_type2 > 0
            )
                profile.atmosphere_trash_type2 -=
                    amounts.atmosphere_trash_type2;

            await mainProfileRepository.save(profile);
            return profile;
        } catch (error: any) {
            if (error instanceof AppError) throw error;

            logger.error(
                `[ProfileService.deductResources] Error for userId: ${userId}`,
                {
                    amounts,
                    error,
                }
            );

            throw ERRORS.DB_ERROR(
                `Failed to deduct resources: ${error.message || "Unknown error"}`
            );
        }
    }

    /**
     * Deducts a specified amount of coins from a user's profile.
     */
    static async deductCoins(userId: string, coins: number) {
        try {
            let userProfile = await MainProfileDAO.findProfileByUserId(userId);

            if (!userProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            if (userProfile.coins < coins) {
                throw ERRORS.VALIDATION("Not enough coins");
            }

            userProfile.coins -= coins;
            await mainProfileRepository.save(userProfile);
            return userProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[ProfileService.deductCoins] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to deduct coins: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * Deducts a specified amount of gems from a user's profile.
     */
    static async deductGems(userId: string, gems: number) {
        try {
            let userProfile = await MainProfileDAO.findProfileByUserId(userId);

            if (!userProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            if (userProfile.gems < gems) {
                throw ERRORS.VALIDATION("Not enough gems");
            }

            userProfile.gems -= gems;
            await mainProfileRepository.save(userProfile);
            return userProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[ProfileService.deductGems] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to deduct gems: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * Deducts a specified amount of minerals from a user's profile.
     */
    static async deductMineral(userId: string, mineralAmount: number) {
        try {
            const userProfile =
                await MainProfileDAO.findProfileByUserId(userId);

            if (!userProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            if (userProfile.mineral < mineralAmount) {
                throw ERRORS.VALIDATION("Not enough minerals");
            }

            userProfile.mineral -= mineralAmount;
            await mainProfileRepository.save(userProfile);
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[ProfileService.deductMineral] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to deduct mineral: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * Atomically deducts both minerals and coins from a user's profile.
     */
    static async deductMineralAndCoin(
        userId: string,
        mineralAmount: number,
        coinAmount: number
    ) {
        try {
            const userProfile =
                await MainProfileDAO.findProfileByUserId(userId);

            if (!userProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            if (userProfile.mineral < mineralAmount) {
                throw ERRORS.VALIDATION("Not enough minerals");
            }

            if (userProfile.coins < coinAmount) {
                throw ERRORS.VALIDATION("Not enough coins");
            }

            userProfile.mineral -= mineralAmount;
            userProfile.coins -= coinAmount;

            await mainProfileRepository.save(userProfile);
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[ProfileService.deductMineralAndCoin] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to deduct mineral and coin: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * Deducts a type2 trash.
     */
    static async deductAtmosphereAstroid(userId: string) {
        try {
            const userProfile =
                await MainProfileDAO.findProfileByUserId(userId);

            if (!userProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            if (userProfile.atmosphere_trash_type2 <= 0) {
                throw ERRORS.VALIDATION("No astroid found");
            }

            userProfile.atmosphere_trash_type2 -= 1;

            await mainProfileRepository.save(userProfile);
        } catch (error) {
            logger.error(
                `[ProfileService.deductAtmosphereAstroid] Error for userId: ${userId}`,
                { error }
            );
        }
    }
}
