import { factoryRepository } from "./repositories/index.ts";
import { Factory } from "@/models/redis/factory";
import _ from "lodash";
import logger from "@/utils/logger";
import { ERRORS } from "@/common/errors/appError";

/**
 * Data Access Object for Factory-related operations.
 * Handles all interactions with the Redis database for the Factory entity.
 */
export class FactoryDAO {
    /**
     * Creates a new Factory profile for a user.
     * @param factoryInfo - The initial data for the factory.
     * @returns The created Factory entity.
     */
    static async createFactory(factoryInfo: Factory) {
        try {
            await factoryRepository.save(factoryInfo.userId, factoryInfo);
            return factoryInfo;
        } catch (error) {
            logger.error(
                `[FactoryDAO.createFactory] Error for userId: ${factoryInfo.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to create factory: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Finds a Factory profile by user ID.
     * @param userId - The ID of the user to find the factory for.
     * @returns The Factory entity if found, otherwise null.
     */
    static async findFactoryByUserId(userId: string) {
        try {
            const factory = await factoryRepository.fetch(userId);

            // When redis-om doesn't find an entity, it returns an object
            // with the searched ID but with null properties.
            // A reliable way to check for existence is to verify a mandatory field.
            return _.isNil(factory.userId) ? null : factory;
        } catch (error) {
            logger.error(
                `[FactoryDAO.findFactoryByUserId] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to fetch factory: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Saves a Factory profile.
     * @param factoryProfile - The Factory profile to save.
     * @returns The saved Factory entity.
     */
    static async saveFactoryProfile(factoryProfile: Factory): Promise<Factory> {
        try {
            await factoryRepository.save(factoryProfile);
            return factoryProfile;
        } catch (error) {
            logger.error(
                `[FactoryDAO.saveFactoryProfile] Error for userId: ${factoryProfile.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to save factory: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }
}
