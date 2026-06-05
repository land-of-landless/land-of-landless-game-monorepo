import EnergyGeneratorDAO from "@/daos/energyGenerator.js";
import ProfileService from "@/services/mainProfile/ProfileService.js";
import {
    ENERGY_GENERATOR_COST_PER_PANEL,
    EnergyGeneratorLevelsType,
    ENERGY_GENERATOR_MAX_LEVEL,
    ENERGY_GENERATOR_UPGRADE_INFO,
} from "@/constants/energyGenerator.js";
import { turnTimeInMsToGemsToBePaid } from "@/utils/index.js";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";

/**
 * Service class for handling Energy Generator business logic.
 * Backed by PostgreSQL via EnergyGeneratorDAO (drizzle-orm).
 */
export default class EnergyGeneratorService {
    /**
     * Starts the upgrade process for an energy generator.
     * @param userId - The ID of the user.
     * @returns The start time of the upgrade (ISO string).
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
                1) as EnergyGeneratorLevelsType;

            let coinsToBePaid =
                ENERGY_GENERATOR_UPGRADE_INFO[newLevel].coinCost;

            let now = new Date();
            energyGeneratorProfile.upgrade_timer = now.toISOString();

            await ProfileService.deductCoins(userId, coinsToBePaid);

            await EnergyGeneratorDAO.saveEnergyGeneratorProfile(
                energyGeneratorProfile,
            );
            return energyGeneratorProfile.upgrade_timer;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[EnergyGeneratorService.upgradeEnergyGeneratorStart] Error for userId: ${userId}`,
                { error },
            );
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
                1) as EnergyGeneratorLevelsType;

            let timeToWait = ENERGY_GENERATOR_UPGRADE_INFO[newLevel].time;

            let now = new Date();
            let startTime = new Date(energyGeneratorProfile.upgrade_timer);
            let passedTime = Math.floor(now.getTime() - startTime.getTime());

            if (passedTime < 0) {
                throw ERRORS.VALIDATION("Invalid time");
            }

            if (skipWithGem) {
                if (passedTime >= timeToWait) {
                    throw ERRORS.VALIDATION("Already ended");
                }

                let remainingTime = timeToWait - passedTime;
                let gemsToBePaid = turnTimeInMsToGemsToBePaid(remainingTime);

                await ProfileService.deductGems(userId, gemsToBePaid);
            } else {
                if (passedTime < timeToWait) {
                    throw ERRORS.VALIDATION("Not enough time passed");
                }
            }

            energyGeneratorProfile.level = newLevel;
            energyGeneratorProfile.upgrade_timer = "";

            await EnergyGeneratorDAO.saveEnergyGeneratorProfile(
                energyGeneratorProfile,
            );
            return energyGeneratorProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[EnergyGeneratorService.upgradeEnergyGeneratorEnd] Error for userId: ${userId}`,
                { error },
            );
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

            if (
                ENERGY_GENERATOR_UPGRADE_INFO[currentLevel as EnergyGeneratorLevelsType].maxPanels <
                newPanelCount
            ) {
                throw ERRORS.VALIDATION("Max panel count reached");
            }

            let coinsToBePaid = ENERGY_GENERATOR_COST_PER_PANEL;
            await ProfileService.deductCoins(userId, coinsToBePaid);

            energyGeneratorProfile.panel_count = newPanelCount;

            await ProfileService.updateEnergyGenerationRate(
                userId,
                newPanelCount,
            );

            await EnergyGeneratorDAO.saveEnergyGeneratorProfile(
                energyGeneratorProfile,
            );
            return energyGeneratorProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[EnergyGeneratorService.addPanel] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to add panel: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }
}
