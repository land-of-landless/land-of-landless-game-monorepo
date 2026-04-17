import EnergyGeneratorDAO from "@/daos/redis/energyGenerator";
import { energyGeneratorRepository } from "@/daos/redis/repositories/index";
import ProfileService from "@/services/mainProfile/ProfileService";
import {
    ENERGY_GENERATOR_COST_PER_PANEL,
    ENERGY_GENERATOR_LEVELS_TYPE,
    ENERGY_GENERATOR_MAX_LEVEL,
    ENERGY_GENERATOR_UPGRADE_INFO,
} from "@/constants/energyGenerator";
import { turnTimeInMsToGemsToBePaid } from "@/utils/index";
import { ERRORS } from "@/common/errors/appError";
import logger from "@/utils/logger";

/**
 * Service class for handling Energy Generator business logic.
 */
export default class EnergyGeneratorService {
    /**
     * Starts the upgrade process for an energy generator.
     * @param userId - The ID of the user.
     * @returns The start time of the upgrade.
     */
    static async upgradeEnergyGeneratorStart(userId: string) {
        try {
            const energyGeneratorProfile =
                await EnergyGeneratorDAO.findEnergyGeneratorByUserId(userId);

            if (!energyGeneratorProfile) {
                throw ERRORS.NOT_FOUND("Energy generator not found");
            }

            if (energyGeneratorProfile.upgrade_timer !== "") {
                throw ERRORS.VALIDATION("Upgrade already in progress");
            }

            if (energyGeneratorProfile.level >= ENERGY_GENERATOR_MAX_LEVEL) {
                throw ERRORS.VALIDATION("Max level reached");
            }

            let newLevel = (energyGeneratorProfile.level +
                1) as ENERGY_GENERATOR_LEVELS_TYPE;

            // coins to be paid
            let coinsToBePaid =
                ENERGY_GENERATOR_UPGRADE_INFO[newLevel].coinCost;

            // set timer
            let now = new Date();
            energyGeneratorProfile.upgrade_timer = now.toUTCString();

            // deduct coins
            await ProfileService.deductCoins(userId, coinsToBePaid);

            await energyGeneratorRepository.save(energyGeneratorProfile);
            return energyGeneratorProfile.upgrade_timer;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to start energy generator upgrade: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Completes the upgrade process for an energy generator.
     * @param userId - The ID of the user.
     * @param skipWithGem - Whether to use gems to skip the upgrade timer.
     * @returns The updated energy generator profile.
     */
    static async upgradeEnergyGeneratorEnd(
        userId: string,
        skipWithGem: boolean,
    ) {
        try {
            const energyGeneratorProfile =
                await EnergyGeneratorDAO.findEnergyGeneratorByUserId(userId);

            if (!energyGeneratorProfile) {
                throw ERRORS.NOT_FOUND("Energy generator not found");
            }

            if (energyGeneratorProfile.upgrade_timer === "") {
                throw ERRORS.VALIDATION("Upgrade isn't in progress");
            }

            if (energyGeneratorProfile.level >= ENERGY_GENERATOR_MAX_LEVEL) {
                throw ERRORS.VALIDATION("Max level reached");
            }

            let newLevel = (energyGeneratorProfile.level +
                1) as ENERGY_GENERATOR_LEVELS_TYPE;

            let timeToWait = ENERGY_GENERATOR_UPGRADE_INFO[newLevel].time;

            // check timer
            let now = new Date();
            let startTime = new Date(energyGeneratorProfile.upgrade_timer);
            let passedTime = Math.floor(now.getTime() - startTime.getTime());

            if (passedTime < 0) {
                throw ERRORS.VALIDATION("Invalid time");
            }

            // check for skip with gem
            if (skipWithGem) {
                // turn remaining time to gem equivalent
                if (passedTime >= timeToWait) {
                    throw ERRORS.VALIDATION("Already ended");
                }

                let remainingTime = timeToWait - passedTime;
                let gemsToBePaid = turnTimeInMsToGemsToBePaid(remainingTime);

                // deduct Gems
                await ProfileService.deductGems(userId, gemsToBePaid);
            } else {
                if (passedTime < timeToWait) {
                    throw ERRORS.VALIDATION("Not enough time passed");
                }
            }

            // update level
            energyGeneratorProfile.level = newLevel;

            // reset timer
            energyGeneratorProfile.upgrade_timer = "";

            await energyGeneratorRepository.save(energyGeneratorProfile);
            return energyGeneratorProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to complete energy generator upgrade: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Adds a new panel to the energy generator.
     * @param userId - The ID of the user.
     * @returns The updated energy generator profile.
     */
    static async addPanel(userId: string) {
        try {
            const energyGeneratorProfile =
                await EnergyGeneratorDAO.findEnergyGeneratorByUserId(userId);

            if (!energyGeneratorProfile) {
                throw ERRORS.NOT_FOUND("Energy generator not found");
            }

            // check if it's being upgraded
            if (energyGeneratorProfile.upgrade_timer !== "") {
                throw ERRORS.VALIDATION(
                    "wait for energy generator upgrade to finish",
                );
            }

            let newPanelCount = energyGeneratorProfile.panel_count + 1;
            let currentLevel = energyGeneratorProfile.level;

            if (currentLevel === 0) {
                throw ERRORS.VALIDATION("Energy generator is not built");
            }

            // checks to see if we are allowed to build a new panel
            if (
                ENERGY_GENERATOR_UPGRADE_INFO[currentLevel].maxPanels <
                newPanelCount
            ) {
                throw ERRORS.VALIDATION("Max panel count reached");
            }

            // deduct price
            let coinsToBePaid = ENERGY_GENERATOR_COST_PER_PANEL;
            await ProfileService.deductCoins(userId, coinsToBePaid);

            energyGeneratorProfile.panel_count = newPanelCount;

            // Update energy generation rate in ProfileService
            await ProfileService.updateEnergyGenerationRate(
                userId,
                newPanelCount,
            );

            await energyGeneratorRepository.save(energyGeneratorProfile);
            return energyGeneratorProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to add panel: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }
}
