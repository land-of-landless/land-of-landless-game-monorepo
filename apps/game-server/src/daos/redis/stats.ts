import { statsRepository } from "@/daos/redis/repositories/index";
import { Stats } from "@/models/redis/stats";
import _ from "lodash";
import { ERRORS } from "@/common/errors/appError";
import logger from "@/utils/logger";

/**
 * Data Access Object for user Stats.
 * Stores lifetime counters (loot boxes opened, launches, etc.).
 */
export default class StatsDAO {
    /**
     * Creates a new Stats profile for a user.
     */
    static async createStats(statsDoc: Stats): Promise<Stats> {
        try {
            await statsRepository.save(statsDoc.userId, statsDoc);
            return statsDoc;
        } catch (error) {
            logger.error(
                `[StatsDAO.createStats] Error for userId: ${statsDoc.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to create stats: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Finds a Stats profile by user ID.
     */
    static async findStatsByUserId(userId: string): Promise<Stats | null> {
        try {
            const statsProfile = await statsRepository.fetch(userId);

            return _.isNil(statsProfile.userId) ? null : statsProfile;
        } catch (error) {
            logger.error(
                `[StatsDAO.findStatsByUserId] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to find stats: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }
}
