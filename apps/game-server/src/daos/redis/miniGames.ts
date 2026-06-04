import { miniGamesRepository } from "@/daos/redis/repositories/index";
import { MiniGames } from "@/models/redis/miniGames";
import _ from "lodash";
import { ERRORS } from "@/common/errors/appError";
import logger from "@/utils/logger";

/**
 * Data Access Object for Mini-Game related operations.
 * Handles all interactions with the Redis database for the MiniGames entity,
 * which stores the state for various mini-games a user can play.
 */
export default class MiniGamesDAO {
    /**
     * Creates a new MiniGames profile for a user, initializing game states.
     * @param miniGamesProfileDoc - The initial data for the mini-games profile.
     * @returns The created MiniGames entity.
     */
    static async createMiniGamesProfile(miniGamesProfileDoc: MiniGames) {
        try {
            await miniGamesRepository.save(
                miniGamesProfileDoc.userId,
                miniGamesProfileDoc,
            );
            return miniGamesProfileDoc;
        } catch (error) {
            logger.error(
                `[MiniGamesDAO.createMiniGamesProfile] Error for userId: ${miniGamesProfileDoc.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to create mini-games profile: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Finds a MiniGames profile by user ID.
     * @param userId - The ID of the user to find the mini-games profile for.
     * @returns The MiniGames entity if found, otherwise null.
     */
    static async findMiniGamesProfileByUserId(userId: string) {
        try {
            const miniGamesProfile = await miniGamesRepository.fetch(userId);

            // When redis-om doesn't find an entity, it returns an object
            // with the searched ID but with null properties.
            // A reliable way to check for existence is to verify a mandatory field.
            return _.isNil(miniGamesProfile.userId) ? null : miniGamesProfile;
        } catch (error) {
            logger.error(
                `[MiniGamesDAO.findMiniGamesProfileByUserId] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to find mini-games profile: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Saves a MiniGames profile.
     * @param miniGamesProfile - The MiniGames profile to save.
     * @returns The saved MiniGames entity.
     */
    static async saveMiniGamesProfile(
        miniGamesProfile: MiniGames,
    ): Promise<MiniGames> {
        try {
            await miniGamesRepository.save(miniGamesProfile);
            return miniGamesProfile;
        } catch (error) {
            logger.error(
                `[MiniGamesDAO.saveMiniGamesProfile] Error for userId: ${miniGamesProfile.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to save mini-games profile: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }
}
