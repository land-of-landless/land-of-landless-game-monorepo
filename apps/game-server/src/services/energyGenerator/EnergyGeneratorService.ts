import { EnergyGeneratorDAO } from "@/daos/postgres/energyGenerator.js";
import ProfileService from "@/services/mainProfile/ProfileService.js";
import {
    ENERGY_GENERATOR_COST_PER_PANEL,
    ENERGY_GENERATOR_MAX_LEVEL,
    ENERGY_GENERATOR_UPGRADE_INFO,
} from "@/constants/energyGenerator.js";
import { turnTimeInMsToGemsToBePaid } from "@/utils/index.js";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";

export default class EnergyGeneratorService {
    static async upgradeEnergyGeneratorStart(userId: string) {
        const energyGeneratorProfile = await EnergyGeneratorDAO.findEnergyGeneratorByUserId(userId);
        if (!energyGeneratorProfile) throw ERRORS.NOT_FOUND("Energy generator not found");
        // ... implementation
        await EnergyGeneratorDAO.saveEnergyGeneratorProfile(energyGeneratorProfile);
        return "";
    }

    static async upgradeEnergyGeneratorEnd(userId: string, skipWithGem: boolean) {
        const energyGeneratorProfile = await EnergyGeneratorDAO.findEnergyGeneratorByUserId(userId);
        if (!energyGeneratorProfile) throw ERRORS.NOT_FOUND("Energy generator not found");
        // ... implementation
        await EnergyGeneratorDAO.saveEnergyGeneratorProfile(energyGeneratorProfile);
        return energyGeneratorProfile;
    }

    static async addPanel(userId: string) {
        const energyGeneratorProfile = await EnergyGeneratorDAO.findEnergyGeneratorByUserId(userId);
        if (!energyGeneratorProfile) throw ERRORS.NOT_FOUND("Energy generator not found");
        // ... implementation
        await EnergyGeneratorDAO.saveEnergyGeneratorProfile(energyGeneratorProfile);
        return energyGeneratorProfile;
    }
}
