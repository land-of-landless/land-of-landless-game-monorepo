import MainProfileDAO from "@/daos/redis/mainProfile";
import { MainProfile } from "@/models/redis/mainProfile";
import { MineDAO } from "@/daos/redis/mine";
import { FactoryDAO } from "@/daos/redis/factory";
import { mainProfileRepository } from "@/daos/redis/repositories/index";
import { ERRORS } from "@/common/errors/appError";
import _ from "lodash";
import {
    BASE_REWARDS,
    gemsPerMinute,
    LOOT_BOX_TIME_TO_OPEN,
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
} from "@/constants/mine";
import {
    LootBoxType,
    MINI_GAMES_ENERGY_COST,
    MINI_GAMES_ID_TYPE,
    miniGameLootBoxNameToNumericIdsMap,
} from "@/constants/miniGames";
import logger from "@/utils/logger";
import {
    checkValForProfanity,
    isProfane,
    isProfaneHive,
    isProfaneProfanityDev,
    isProfaneSightengineML,
    isProfaneSightenginePattern,
} from "@/utils/profanity";
import {
    MINE_MINER_ID_TYPE,
    MINE_UPGRADE_LEVEL_TYPE,
} from "@land-of-landless/lol-game-shared-config";

export default class ProfileService {
    static async checkValForProfanity(val: string) {
        // Check local filter first (fast)
        if (isProfane(val)) return true;
        // Then check all async filters in parallel
        const [hive, profanityDev] = await Promise.all([
            isProfaneHive(val),
            isProfaneProfanityDev(val),
        ]);
        return !(hive || profanityDev);
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
        representedFlag?: string,
    ) {
        try {
            const userProfile =
                await MainProfileDAO.findProfileByUserId(userId);

            if (!userProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            // only update preferences if they are introduced
            if (!_.isNil(name)) {
                // skip if name is not actually changing
                if (userProfile.name !== name) {
                    let resultForProfanityCheck = await checkValForProfanity(
                        name,
                        ["SimpleFilter", "ProfanityDev"],
                    );

                    if (resultForProfanityCheck) {
                        throw ERRORS.FORBIDDEN(
                            "provided name contains profanity",
                        );
                    }

                    // update name of user
                    userProfile.name = name;
                }
            }

            if (!_.isNil(profilePictureIndex)) {
                if (userProfile.profilePictureIndex !== profilePictureIndex) {
                    // End of Rate Limiting Logic (PFP)

                    userProfile.profilePictureIndex = profilePictureIndex;
                }
            }

            if (!_.isNil(representedFlag)) {
                if (userProfile.representedFlag !== representedFlag) {
                    userProfile.representedFlag = representedFlag;
                }
            }

            await mainProfileRepository.save(userProfile);
            return userProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to update profile preferences: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Generates randomized rewards for a loot box based on its type.
     * @param lootBoxType - The type of the loot box (1-4), which determines the reward multiplier.
     * @returns An object containing the calculated rewards (coins, gems, xp, etc.).
     */
    static generateLootBoxRewards(lootBoxType: LootBoxType): {
        coins: number;
        gems: number;
        xp: number;
        tickets: number;
        lootBoxKeys: number;
    } {
        const baseRewards = BASE_REWARDS;

        // Higher loot box types have a higher reward multiplier.
        let multiplier = 1;

        switch (lootBoxType) {
            case "COMMON":
                multiplier = 1;
                break;
            case "UNCOMMON":
                multiplier = 3;
                break;
            case "RARE":
                multiplier = 10;
                break;
            case "EPIC":
                multiplier = 40;
                break;
            case "LEGENDARY":
                multiplier = 60;
                break;
            case "CUSTOM":
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
                        (baseRewards.coins * multiplier) / 2,
                    ),
            ),
            gems: Math.floor(
                baseRewards.gems * multiplier +
                    randomFactor(
                        -(baseRewards.gems * multiplier) / 2,
                        (baseRewards.gems * multiplier) / 2,
                    ),
            ),
            xp: Math.floor(
                baseRewards.xp * multiplier +
                    randomFactor(
                        -(baseRewards.xp * multiplier) / 2,
                        (baseRewards.xp * multiplier) / 2,
                    ),
            ),
            tickets: Math.floor(
                baseRewards.tickets * multiplier +
                    randomFactor(
                        -(baseRewards.tickets * multiplier) / 2,
                        (baseRewards.tickets * multiplier) / 2,
                    ),
            ),

            lootBoxKeys:
                lootBoxType === "EPIC" || lootBoxType === "LEGENDARY" ? 1 : 0,
        };
    }

    /**
     * Starts opening a loot box.
     * @param userId - The ID of the user.
     * @param lootBoxIndex - The index of the loot box in the user's inventory.
     * @returns An object containing the start time.
     */
    static async openLootBoxStart(userId: string, lootBoxIndex: number) {
        try {
            const fetchedUserProfile =
                await MainProfileDAO.findProfileByUserId(userId);
            if (!fetchedUserProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            // --- Validation Checks ---
            const targetLootBox = fetchedUserProfile.lootBoxes[lootBoxIndex];

            // Ensure there is a loot box at the specified index.
            if (targetLootBox === "" || _.isNil(targetLootBox)) {
                throw ERRORS.NOT_FOUND("Loot box not found");
            }

            // Ensure the loot box is not already being opened.
            if (fetchedUserProfile.lootBoxesTimers[lootBoxIndex] !== "") {
                throw ERRORS.VALIDATION("Loot box already opened");
            }

            // --- Worker Bot Availability Check ---
            // Count the number of active worker bots and the number of loot boxes currently opening.
            let numberOfWorkerRobots = fetchedUserProfile.worker_bots.filter(
                (robot: number) => robot === 1,
            ).length;
            let numberOfBoxesBeingOpened =
                fetchedUserProfile.lootBoxesTimers.filter(
                    (box: string) => box !== "",
                ).length;

            // The user must have a free worker bot to start opening a new box.
            if (numberOfBoxesBeingOpened >= numberOfWorkerRobots) {
                throw ERRORS.VALIDATION("Not enough worker robots");
            }

            let startTime = new Date().toUTCString();

            fetchedUserProfile.lootBoxesTimers[lootBoxIndex] = startTime;

            await mainProfileRepository.save(fetchedUserProfile);

            return {
                startToOpenTime: startTime,
            };
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[ProfileService.openLootBox] Error for userId: ${userId}`,
                {
                    error,
                },
            );
            throw ERRORS.DB_ERROR(
                `Failed to open lootbox: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Finalizes the process of opening a loot box after the timer has completed.
     * @param userId - The ID of the user.
     * @param lootBoxIndex - The index of the loot box.
     * @returns The rewards generated from the loot box.
     */
    static async openLootBoxEnd(userId: string, lootBoxIndex: number) {
        try {
            const fetchedUserProfile =
                await MainProfileDAO.findProfileByUserId(userId);

            if (!fetchedUserProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            // --- Validation Checks ---
            const targetLootBox = fetchedUserProfile.lootBoxes[lootBoxIndex];

            // Ensure there is a loot box at the specified index.
            if (targetLootBox === "" || _.isNil(targetLootBox)) {
                throw ERRORS.NOT_FOUND("Loot box not found");
            }

            // Ensure the loot box has a timer running.
            if (fetchedUserProfile.lootBoxesTimers[lootBoxIndex] === "") {
                throw ERRORS.VALIDATION("Loot box already opened");
            }

            // --- Timer Check ---
            // Calculate the time elapsed since the opening process started.
            let now = new Date().getTime();
            let lootBoxStartToOpenTime = new Date(
                fetchedUserProfile.lootBoxesTimers[lootBoxIndex],
            ).getTime();
            let passedTimeSoFar = now - lootBoxStartToOpenTime;

            // The elapsed time should not be negative.
            if (passedTimeSoFar < 0) {
                throw ERRORS.VALIDATION("Invalid time");
            }
            let expectedTimeToPass =
                LOOT_BOX_TIME_TO_OPEN[targetLootBox] /
                fetchedUserProfile.lootBoxesOpeningRate;

            // Ensure enough time has passed to complete the opening.
            if (passedTimeSoFar < expectedTimeToPass) {
                throw ERRORS.VALIDATION("Not enough time passed");
            }

            // --- Apply Rewards and Update MainProfile ---
            // Generate the rewards for the loot box.
            const rewards = this.generateLootBoxRewards(targetLootBox);

            // Add the rewards to the user's profile.
            fetchedUserProfile.coins += rewards.coins;
            fetchedUserProfile.gems += rewards.gems;
            fetchedUserProfile.xp += rewards.xp;
            fetchedUserProfile.tickets_type2 += rewards.tickets;
            fetchedUserProfile.lootBox_keys += rewards.lootBoxKeys;

            // Update statistics for the number of opened boxes of this type.
            fetchedUserProfile.lootBoxes_opened[
                miniGameLootBoxNameToNumericIdsMap[targetLootBox] - 1
            ] += 1;

            // Reset the loot box slot to make it available again.
            fetchedUserProfile.lootBoxesTimers[lootBoxIndex] = "";
            fetchedUserProfile.lootBoxes[lootBoxIndex] = "";

            await mainProfileRepository.save(fetchedUserProfile);
            return rewards;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[ProfileService.openLootBoxEnd] Error for userId: ${userId}`,
                {
                    error,
                },
            );
            throw ERRORS.DB_ERROR(
                `Failed to end opening lootbox: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Instantly opens a loot box using gems to skip the remaining time.
     * @param userId - The ID of the user.
     * @param lootBoxIndex - The index of the loot box.
     * @returns The updated profile.
     */
    static async openLootBoxEndWithGems(userId: string, lootBoxIndex: number) {
        try {
            const fetchedUserProfile =
                await MainProfileDAO.findProfileByUserId(userId);

            if (!fetchedUserProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            // --- Validation Checks ---
            const targetLootBox = fetchedUserProfile.lootBoxes[lootBoxIndex];

            // Ensure there is a loot box at the specified index.
            if (targetLootBox === "" || _.isNil(targetLootBox)) {
                throw ERRORS.NOT_FOUND("Loot box not found");
            }

            // Ensure the loot box has a timer running.
            if (fetchedUserProfile.lootBoxesTimers[lootBoxIndex] === "") {
                throw ERRORS.VALIDATION("Loot box already opened");
            }

            // --- Gem Cost Calculation ---
            // Calculate the remaining time on the loot box timer.
            let now = new Date().getTime();
            let lootBoxStartToOpenTime = new Date(
                fetchedUserProfile.lootBoxesTimers[lootBoxIndex],
            ).getTime();
            let targetTime =
                lootBoxStartToOpenTime + LOOT_BOX_TIME_TO_OPEN[targetLootBox];
            let remainingTime = Math.floor(
                (targetTime - now) / fetchedUserProfile.lootBoxesOpeningRate,
            );

            // If the timer is already finished, this method should not be used.
            if (remainingTime <= 0) {
                throw ERRORS.VALIDATION("Invalid time");
            }

            // Convert the remaining time into the equivalent cost in gems.
            let expectedGemsToOpen = Math.floor(
                (remainingTime / 1000 / 60) * gemsPerMinute,
            );

            // A minimum of 1 gem is required.
            if (expectedGemsToOpen === 0) {
                throw ERRORS.VALIDATION("Not possible!");
            }

            // Check if the user has enough gems to pay.
            if (expectedGemsToOpen > fetchedUserProfile.gems) {
                throw ERRORS.VALIDATION("Not enough gems");
            }

            // --- Apply Rewards and Update MainProfile ---
            fetchedUserProfile.gems -= expectedGemsToOpen;

            // Generate and apply rewards.
            const rewards = this.generateLootBoxRewards(targetLootBox);

            // Add the rewards to the user's profile.
            fetchedUserProfile.coins += rewards.coins;
            fetchedUserProfile.gems += rewards.gems;
            fetchedUserProfile.xp += rewards.xp;
            fetchedUserProfile.tickets_type2 += rewards.tickets;
            fetchedUserProfile.lootBox_keys += rewards.lootBoxKeys;

            // Update statistics for the number of opened boxes of this type.
            fetchedUserProfile.lootBoxes_opened[
                miniGameLootBoxNameToNumericIdsMap[targetLootBox] - 1
            ] += 1;

            // Reset the loot box slot to make it available again.
            fetchedUserProfile.lootBoxesTimers[lootBoxIndex] = "";
            fetchedUserProfile.lootBoxes[lootBoxIndex] = "";

            await mainProfileRepository.save(fetchedUserProfile);
            return fetchedUserProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[ProfileService.openLootBoxEndWithGems] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to open lootbox with gems: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Instantly opens a loot box using a key, bypassing the timer.
     * @param userId - The ID of the user.
     * @param lootBoxIndex - The index of the loot box.
     * @returns The rewards generated from the loot box.
     */
    static async openLootBoxEndWithKey(userId: string, lootBoxIndex: number) {
        try {
            const fetchedUserProfile =
                await MainProfileDAO.findProfileByUserId(userId);

            if (!fetchedUserProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            // --- Validation Checks ---
            const targetLootBox = fetchedUserProfile.lootBoxes[lootBoxIndex];

            // Ensure there is a loot box at the specified index.
            if (targetLootBox === "" || _.isNil(targetLootBox)) {
                throw ERRORS.NOT_FOUND("Loot box not found");
            }

            // This check might be redundant if keys can open boxes that haven't started opening.
            if (fetchedUserProfile.lootBoxesTimers[lootBoxIndex] === "") {
                throw ERRORS.VALIDATION("Loot box already opened");
            }

            // Ensure the user has a key to spend.
            if (fetchedUserProfile.lootBox_keys <= 0) {
                throw ERRORS.VALIDATION("No key found");
            }

            // --- Apply Rewards and Update MainProfile ---
            const rewards = this.generateLootBoxRewards(targetLootBox);

            // Deduct one key from the user's inventory.
            fetchedUserProfile.lootBox_keys -= 1;
            // Add the rewards to the user's profile.
            fetchedUserProfile.coins += rewards.coins;
            fetchedUserProfile.gems += rewards.gems;
            fetchedUserProfile.xp += rewards.xp;
            fetchedUserProfile.tickets_type2 += rewards.tickets;
            fetchedUserProfile.lootBox_keys += rewards.lootBoxKeys;

            // Update statistics for the number of opened boxes of this type.
            fetchedUserProfile.lootBoxes_opened[
                miniGameLootBoxNameToNumericIdsMap[targetLootBox] - 1
            ] += 1;

            // Reset the loot box slot to make it available again.
            fetchedUserProfile.lootBoxesTimers[lootBoxIndex] = "";
            fetchedUserProfile.lootBoxes[lootBoxIndex] = "";
            await mainProfileRepository.save(fetchedUserProfile);

            return rewards;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[ProfileService.openLootBoxEndWithKey] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to open lootbox with key: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Adds a new loot box to the first available empty slot in the user's inventory.
     * @param userId - The ID of the user.
     * @param lootBoxType - The type of loot box to add (1-4).
     * @returns The updated profile.
     */
    static async addLootBox(
        userId: string,
        lootBoxType: LootBoxType,
        softAdd?: boolean,
    ) {
        try {
            const userProfile =
                await MainProfileDAO.findProfileByUserId(userId);

            if (!userProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            // Find the first empty loot box slot (represented by 0).
            const emptySlotIndex = userProfile.lootBoxes.findIndex(
                (slot: LootBoxType | "") => slot === "",
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
                },
            );
            throw ERRORS.DB_ERROR(
                `Failed to add loot box: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Updates the user's energy generation rate based on the number of new panels added.
     */
    static async updateEnergyGenerationRate(
        userId: string,
        newPanelCount: number,
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
                }`,
            );
        }
    }

    /**
     * Deducts the energy cost for starting a game.
     */
    static async chargeEnergy(userId: string, gameId: MINI_GAMES_ID_TYPE) {
        try {
            const userProfile =
                await MainProfileDAO.findProfileByUserId(userId);

            if (!userProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            // Get the energy cost for the specified game.
            const energyCost = MINI_GAMES_ENERGY_COST[gameId];

            // Ensure the user has enough energy.
            if (userProfile.energy < energyCost.energy) {
                throw ERRORS.VALIDATION("Not enough energy");
            }

            // Deduct the energy and save the updated profile.
            userProfile.energy -= energyCost.energy;
            await mainProfileRepository.save(userProfile);
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to charge energy: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
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
                fetchedUserProfile.energy_updated_at,
            );
            let passedTime = now.getTime() - previousUpdatedAt.getTime();

            if (passedTime < 0) {
                throw ERRORS.VALIDATION("Invalid time");
            }

            // Calculate the amount of energy generated during the elapsed time.
            let generatedEnergy = Math.floor(
                (passedTime / 1000 / 60 / 60) *
                    fetchedUserProfile.energy_generation_rate,
            );

            // Add the generated energy, ensuring it does not exceed the maximum capacity.
            let newEnergy = Math.min(
                fetchedUserProfile.energy_max,
                fetchedUserProfile.energy + generatedEnergy,
            );

            // Calculate the new timestamp.
            let newEnergyUpdatedAt = new Date(
                previousUpdatedAt.getTime() +
                    Math.floor(
                        (generatedEnergy * 1000 * 60 * 60) /
                            fetchedUserProfile.energy_generation_rate,
                    ),
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
                }`,
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
                    | MINE_UPGRADE_LEVEL_TYPE
                    | 0;
                if (currentLevel === 0) {
                    continue;
                }
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
                }`,
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
                fetchedUserProfile.mineral_updated_at,
            );
            let passedTime = now.getTime() - previousUpdatedAt.getTime();

            if (passedTime < 0) {
                throw ERRORS.VALIDATION("Invalid time");
            }

            // Calculate the amount of minerals generated during the elapsed time.
            let generatedMineral = Math.floor(
                (passedTime / 1000 / 60 / 60) *
                    fetchedUserProfile.mineral_generation_rate,
            );

            // Add the generated minerals, ensuring it does not exceed the maximum capacity.
            let newMineral = Math.min(
                fetchedUserProfile.mineral_max,
                fetchedUserProfile.mineral + generatedMineral,
            );

            // Calculate the new timestamp.
            let newMineralUpdatedAt = new Date(
                previousUpdatedAt.getTime() +
                    Math.floor(
                        (generatedMineral * 1000 * 60 * 60) /
                            fetchedUserProfile.mineral_generation_rate,
                    ),
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
                }`,
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
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to deduct coins: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
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
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to deduct gems: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
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
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to deduct mineral: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Atomically deducts both minerals and coins from a user's profile.
     */
    static async deductMineralAndCoin(
        userId: string,
        mineralAmount: number,
        coinAmount: number,
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
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to deduct mineral and coin: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
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
                { error },
            );
        }
    }
}
