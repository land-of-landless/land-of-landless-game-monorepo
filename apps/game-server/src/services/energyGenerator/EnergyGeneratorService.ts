import { EnergyGeneratorDAO } from "@/daos/postgres/energyGenerator.js";
import ProfileService from "@/services/mainProfile/ProfileService.js";
import {
    ENERGY_GENERATOR_COST_PER_PANEL,
    EnergyGeneratorLevelsType,
    ENERGY_GENERATOR_MAX_LEVEL,
    ENERGY_GENERATOR_UPGRADE_INFO,
    ENERGY_GENERATOR_INCREASE_PER_PANEL,
    ENERGY_GENERATOR_BASE_ENERGY_GENERATION_RATE,
} from "@/constants/energyGenerator.js";
import { turnTimeInMsToGemsToBePaid } from "@/utils/index.js";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";

export default class EnergyGeneratorService {
    static async upgradeEnergyGeneratorStart(userId: string) {
        try {
            const energyGeneratorProfile = await EnergyGeneratorDAO.findEnergyGeneratorByUserId(userId);
            if (!energyGeneratorProfile) throw ERRORS.NOT_FOUND("Energy generator not found");
            if (energyGeneratorProfile.upgrade_timer !== "") throw ERRORS.VALIDATION("Upgrade already in progress");
            if (energyGeneratorProfile.level >= ENERGY_GENERATOR_MAX_LEVEL) throw ERRORS.VALIDATION("Max level reached");

            const newLevel = (energyGeneratorProfile.level + 1) as EnergyGeneratorLevelsType;
            const coinsToBePaid = ENERGY_GENERATOR_UPGRADE_INFO[newLevel].coinCost;

            await ProfileService.deductCoins(userId, coinsToBePaid);

            energyGeneratorProfile.upgrade_timer = new Date().toUTCString();
            await EnergyGeneratorDAO.saveEnergyGeneratorProfile(energyGeneratorProfile);
            return energyGeneratorProfile.upgrade_timer;
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            throw ERRORS.DB_ERROR(`Failed to start energy generator upgrade: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    static async upgradeEnergyGeneratorEnd(userId: string, skipWithGem: boolean) {
        try {
            const energyGeneratorProfile = await EnergyGeneratorDAO.findEnergyGeneratorByUserId(userId);
            if (!energyGeneratorProfile) throw ERRORS.NOT_FOUND("Energy generator not found");
            if (energyGeneratorProfile.upgrade_timer === "") throw ERRORS.VALIDATION("Upgrade isn't in progress");

            const newLevel = (energyGeneratorProfile.level + 1) as EnergyGeneratorLevelsType;
            const timeToWait = ENERGY_GENERATOR_UPGRADE_INFO[newLevel].time;
            const startTime = new Date(energyGeneratorProfile.upgrade_timer);
            const passedTime = Date.now() - startTime.getTime();

            if (skipWithGem) {
                const remainingTime = Math.max(0, timeToWait - passedTime);
                const gemsToPay = turnTimeInMsToGemsToBePaid(remainingTime);
                await ProfileService.deductGems(userId, gemsToPay);
            } else {
                if (passedTime < timeToWait) throw ERRORS.VALIDATION("Not enough time passed");
            }

            energyGeneratorProfile.level = newLevel;
            energyGeneratorProfile.upgrade_timer = "";

            await EnergyGeneratorDAO.saveEnergyGeneratorProfile(energyGeneratorProfile);
            return energyGeneratorProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            throw ERRORS.DB_ERROR(`Failed to complete energy generator upgrade: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    static async addPanel(userId: string) {
        try {
            const energyGeneratorProfile = await EnergyGeneratorDAO.findEnergyGeneratorByUserId(userId);
            if (!energyGeneratorProfile) throw ERRORS.NOT_FOUND("Energy generator not found");
            if (energyGeneratorProfile.upgrade_timer !== "") throw ERRORS.VALIDATION("wait for energy generator upgrade to finish");

            const newPanelCount = energyGeneratorProfile.panel_count + 1;
            const currentLevel = energyGeneratorProfile.level;
            if (currentLevel === 0) throw ERRORS.VALIDATION("Energy generator is not built");
            if (ENERGY_GENERATOR_UPGRADE_INFO[currentLevel as EnergyGeneratorLevelsType].maxPanels < newPanelCount) throw ERRORS.VALIDATION("Max panel count reached");

            const coinsToBePaid = ENERGY_GENERATOR_COST_PER_PANEL;
            await ProfileService.deductCoins(userId, coinsToBePaid);

            energyGeneratorProfile.panel_count = newPanelCount;
            await ProfileService.updateEnergyGenerationRate(userId, newPanelCount);
            await EnergyGeneratorDAO.saveEnergyGeneratorProfile(energyGeneratorProfile);
            return energyGeneratorProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            throw ERRORS.DB_ERROR(`Failed to add panel: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
