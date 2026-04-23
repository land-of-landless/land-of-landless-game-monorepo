import { billingRepository } from "@/daos/redis/repositories/index.js";
import { Billing } from "@/models/redis/billing.js";
import _ from "lodash";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";

/**
 * Data Access Object for Billing-related operations.
 * Handles all interactions with the Redis database for the Billing entity,
 * including invoice management and rate limiting data.
 */
export default class BillingDAO {
    /**
     * Creates a new Billing profile for a user.
     * @param billingData - The initial data for the billing profile.
     * @returns The created Billing entity.
     */
    static async createBilling(billingData: Billing) {
        try {
            await billingRepository.save(billingData.userId, billingData);
            return billingData;
        } catch (error) {
            logger.error(
                `[BillingDAO.createBilling] Error for userId: ${billingData.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to create billing: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Finds a Billing profile by user ID.
     * @param userId - The ID of the user to find the billing profile for.
     * @returns The Billing entity if found, otherwise null.
     */
    static async findBillingById(userId: string) {
        try {
            const billing = await billingRepository.fetch(userId);

            // When redis-om doesn't find an entity, it returns an object
            // with the searched ID but with null properties.
            // A reliable way to check for existence is to verify a mandatory field.
            return _.isNil(billing.userId) ? null : billing;
        } catch (error) {
            logger.error(
                `[BillingDAO.findBillingById] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to fetch billing: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Saves a Billing profile.
     * @param billingProfile - The Billing profile to save.
     * @returns The saved Billing entity.
     */
    static async saveBillingProfile(billingProfile: Billing): Promise<Billing> {
        try {
            await billingRepository.save(billingProfile);
            return billingProfile;
        } catch (error) {
            logger.error(
                `[BillingDAO.saveBillingProfile] Error for userId: ${billingProfile.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to save billing: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }
}
