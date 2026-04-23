import { energyGeneratorRepository } from "@/daos/redis/repositories/index.js";
import { EnergyGenerator } from "@/models/redis/energyGenerator.js";
import _ from "lodash";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";

/**
 * Data Access Object for Energy Generator operations.
 * Handles database persistence and retrieval for energy generator profiles.
 */
export default class EnergyGeneratorDAO {
    /**
     * Creates a new Energy Generator profile for a user.
     * @param energyGeneratorData - The initial data for the energy generator.
     * @returns The created EnergyGenerator entity.
     */
    static async createEnergyGenerator(energyGeneratorData: EnergyGenerator) {
        try {
            await energyGeneratorRepository.save(
                energyGeneratorData.userId,
                energyGeneratorData,
            );
            return energyGeneratorData;
        } catch (error) {
            logger.error(
                `[EnergyGeneratorDAO.createEnergyGenerator] Error for userId: ${energyGeneratorData.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to create energy generator: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Finds an Energy Generator profile by user ID.
     * @param userId - The ID of the user.
     * @returns The EnergyGenerator entity if found, otherwise null.
     */
    static async findEnergyGeneratorByUserId(userId: string) {
        try {
            const energyGenerator =
                await energyGeneratorRepository.fetch(userId);

            // When redis-om doesn't find an entity, it returns an object
            // with the searched ID but with null properties.
            // A reliable way to check for existence is to verify a mandatory field.
            return _.isNil(energyGenerator.userId) ? null : energyGenerator;
        } catch (error) {
            logger.error(
                `[EnergyGeneratorDAO.findEnergyGeneratorByUserId] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to fetch energy generator: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Saves an Energy Generator profile.
     * @param energyGeneratorProfile - The profile to save.
     * @returns The saved EnergyGenerator entity.
     */
    static async saveEnergyGeneratorProfile(
        energyGeneratorProfile: EnergyGenerator,
    ): Promise<EnergyGenerator> {
        try {
            await energyGeneratorRepository.save(energyGeneratorProfile);
            return energyGeneratorProfile;
        } catch (error) {
            logger.error(
                `[EnergyGeneratorDAO.saveEnergyGeneratorProfile] Error for userId: ${energyGeneratorProfile.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to save energy generator: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }
}
