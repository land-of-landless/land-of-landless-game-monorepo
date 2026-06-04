import { labRepository } from "./repositories/index.ts";
import { Lab } from "@/models/redis/lab";
import _ from "lodash";
import { ERRORS } from "@/common/errors/appError";
import logger from "@/utils/logger";

/**
 * Data Access Object for Lab-related operations.
 * Handles all interactions with the Redis database for the Lab entity.
 */
export class LabDAO {
    /**
     * Creates a new Lab profile for a user.
     * @param LabInfo - The initial data for the lab.
     * @returns The created Lab entity.
     */
    static async createLab(LabInfo: Lab): Promise<Lab> {
        try {
            await labRepository.save(LabInfo.userId, LabInfo);
            return LabInfo;
        } catch (error) {
            logger.error(
                `[LabDAO.createLab] Error for userId: ${LabInfo.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to create lab: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Finds a Lab profile by user ID.
     * @param userId - The ID of the user to find the lab for.
     * @returns The Lab entity if found, otherwise null.
     */
    static async findLabByUserId(userId: string): Promise<Lab | null> {
        try {
            const lab = await labRepository.fetch(userId);

            // When redis-om doesn't find an entity, it returns an object
            // with the searched ID but with null properties.
            // A reliable way to check for existence is to verify a mandatory field.
            return _.isNil(lab.userId) ? null : lab;
        } catch (error) {
            logger.error(
                `[LabDAO.findLabByUserId] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to fetch lab: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Saves a Lab profile.
     * @param labProfile - The Lab profile to save.
     * @returns The saved Lab entity.
     */
    static async saveLabProfile(labProfile: Lab): Promise<Lab> {
        try {
            await labRepository.save(labProfile);
            return labProfile;
        } catch (error) {
            logger.error(
                `[LabDAO.saveLabProfile] Error for userId: ${labProfile.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to save lab: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }
}
