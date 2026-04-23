import { mainProfileRepository } from "@/daos/redis/repositories/index.js";
import { MainProfile } from "@/models/redis/mainProfile.js";
import _ from "lodash";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";

/**
 * Data Access Object for the main User Profile.
 * This class is responsible for low-level data access and persistence for user profiles.
 */
export default class MainProfileDAO {
    /**
     * Creates a new user profile.
     * @param profileData - The initial data for the user's profile.
     * @returns The created MainProfile entity.
     */
    static async createProfile(profileData: MainProfile) {
        try {
            await mainProfileRepository.save(profileData.userId, profileData);
            return profileData;
        } catch (error) {
            logger.error(
                `[MainProfileDAO.createProfile] Error for userId: ${profileData.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to create profile: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Saves a user profile.
     * @param profile - The profile to save.
     */
    static async saveProfile(profile: MainProfile) {
        try {
            await mainProfileRepository.save(profile);
            return profile;
        } catch (error) {
            logger.error(
                `[MainProfileDAO.saveProfile] Error for userId: ${profile.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to save profile: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Finds all user profiles.
     * @returns An array of all MainProfile entities.
     */
    static async findAllProfiles(): Promise<MainProfile[]> {
        try {
            return (await mainProfileRepository
                .search()
                .return.all()) as MainProfile[];
        } catch (error) {
            logger.error(
                `[MainProfileDAO.findAllProfiles] Error finding all profiles`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to find all profiles: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Finds a user profile by their unique referral code.
     * @param refCode - The referral code to search for.
     * @returns The MainProfile entity if found, otherwise null.
     */
    static async findProfileByRefCode(refCode: string) {
        try {
            return (await mainProfileRepository
                .search()
                .where("refCode")
                .equals(refCode)
                .return.first()) as MainProfile;
        } catch (error) {
            logger.error(
                `[MainProfileDAO.findProfileByRefCode] Error for refCode: ${refCode}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to find profile by ref code: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Finds a user profile by their user ID.
     * @param userId - The ID of the user.
     * @returns The MainProfile entity if found, otherwise null.
     */
    static async findProfileByUserId(userId: string) {
        try {
            const profile = await mainProfileRepository.fetch(userId);

            // When redis-om doesn't find an entity, it returns an object
            // with the searched ID but with null properties.
            // A reliable way to check for existence is to verify a mandatory field.
            return _.isNil(profile.userId) ? null : (profile as MainProfile);
        } catch (error) {
            logger.error(
                `[MainProfileDAO.findProfileByUserId] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to find profile by userId: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }
}
