import { LaunchSite } from "@/models/redis/launchSite.js";
import _ from "lodash";
import { launchSiteRepository } from "./repositories/index.ts";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";

/**
 * Data Access Object for Launch Site-related operations.
 * Handles all interactions with the Redis database for the LaunchSite entity.
 */
export class LaunchSiteDAO {
    /**
     * Creates a new Launch Site profile for a user.
     * @param launchSiteInfo - The initial data for the launch site.
     * @returns The created LaunchSite entity.
     */
    static async createLaunchSite(
        launchSiteInfo: LaunchSite,
    ): Promise<LaunchSite> {
        try {
            await launchSiteRepository.save(
                launchSiteInfo.userId,
                launchSiteInfo,
            );
            return launchSiteInfo;
        } catch (error) {
            logger.error(
                `[LaunchSiteDAO.createLaunchSite] Error for userId: ${launchSiteInfo.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to create launch site: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Finds a Launch Site profile by user ID.
     * @param userId - The ID of the user to find the launch site for.
     * @returns The LaunchSite entity if found, otherwise null.
     */
    static async findLaunchSiteByUserId(
        userId: string,
    ): Promise<LaunchSite | null> {
        try {
            const launchSiteProfile = await launchSiteRepository.fetch(userId);

            return _.isNil(launchSiteProfile.userId) ? null : launchSiteProfile;
        } catch (error) {
            logger.error(
                `[LaunchSiteDAO.findLaunchSiteByUserId] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to find launch site by userId: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Saves a Launch Site profile.
     * @param launchSiteProfile - The LaunchSite profile to save.
     * @returns The saved LaunchSite entity.
     */
    static async saveLaunchSiteProfile(
        launchSiteProfile: LaunchSite,
    ): Promise<LaunchSite> {
        try {
            await launchSiteRepository.save(launchSiteProfile);
            return launchSiteProfile;
        } catch (error) {
            logger.error(
                `[LaunchSiteDAO.saveLaunchSiteProfile] Error for userId: ${launchSiteProfile.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to save launch site: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }
}
