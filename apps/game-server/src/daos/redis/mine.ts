import { mineRepository } from "./repositories/index";
import { Mine } from "../../models/redis/mine";
import _ from "lodash";
import { ERRORS } from "@/common/errors/appError";
import logger from "@/utils/logger";

/**
 * Data Access Object for Mine-related operations.
 * Handles database persistence and retrieval for mine profiles.
 */
export class MineDAO {
    /**
     * Creates a new Mine profile for a user.
     * @param MineData - The initial data for the mine.
     * @returns The created Mine entity.
     */
    static async createMine(MineData: Mine) {
        try {
            await mineRepository.save(MineData.userId, MineData);
            return MineData;
        } catch (error) {
            logger.error(
                `[MineDAO.createMine] Error for userId: ${MineData.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to create mine: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Finds a Mine profile by user ID.
     * @param userId - The ID of the user to find the mine for.
     * @returns The Mine entity if found, otherwise null.
     */
    static async findMineByUserId(userId: string) {
        try {
            const mine = await mineRepository.fetch(userId);

            // When redis-om doesn't find an entity, it returns an object
            // with the searched ID but with null properties.
            // A reliable way to check for existence is to verify a mandatory field.
            return _.isNil(mine.userId) ? null : mine;
        } catch (error) {
            logger.error(
                `[MineDAO.findMineByUserId] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to find mine: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Saves a Mine profile.
     * @param mineProfile - The Mine profile to save.
     * @returns The saved Mine entity.
     */
    static async saveMineProfile(mineProfile: Mine): Promise<Mine> {
        try {
            await mineRepository.save(mineProfile);
            return mineProfile;
        } catch (error) {
            logger.error(
                `[MineDAO.saveMineProfile] Error for userId: ${mineProfile.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to save mine: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }
}
