import { db } from "./connection.js";
import { identities, identityIps } from "../models/schema.js";
import { eq } from "drizzle-orm";
import logger from "@/utils/logger.js";
import { ERRORS } from "@/common/errors/appError.js";

/**
 * Data Access Object for Identity-related operations.
 * Handles database persistence and retrieval for identity profiles in PostgreSQL.
 */
export default class IdentityDAO {
    /**
     * Creates a new Identity for a user (does nothing if already exists).
     * @param identityData - The initial identity data.
     * @returns The created identity data.
     */
    static async createIdentity(identityData: any) {
        try {
            return await db.transaction(async (tx) => {
                await tx
                    .insert(identities)
                    .values({ userId: identityData.userId })
                    .onConflictDoNothing();

                await tx
                    .delete(identityIps)
                    .where(eq(identityIps.userId, identityData.userId));
                if (identityData.ips?.length > 0) {
                    await tx.insert(identityIps).values(
                        identityData.ips.map((ip: string, index: number) => ({
                            userId: identityData.userId,
                            ip,
                            count: identityData.ips_count?.[index] || 0,
                        })),
                    );
                }

                return identityData;
            });
        } catch (error) {
            logger.error(
                `[IdentityDAO.createIdentity] Error for userId: ${identityData.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to create identity: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Finds an Identity profile by user ID.
     * @param userId - The ID of the user.
     * @returns The identity data if found, otherwise null.
     */
    static async findIdentityByUserId(userId: string) {
        try {
            const res = await db.query.identities.findFirst({
                where: eq(identities.userId, userId),
            });
            if (!res) return null;

            const ips = await db
                .select()
                .from(identityIps)
                .where(eq(identityIps.userId, userId));

            return {
                userId: res.userId,
                ips: ips.map((i) => i.ip),
                ips_count: ips.map((i) => i.count),
            };
        } catch (error) {
            logger.error(
                `[IdentityDAO.findIdentityByUserId] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to find identity: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Saves (upserts) an Identity profile.
     * @param identityProfile - The identity profile data to save.
     * @returns The saved identity data.
     */
    static async saveIdentityProfile(identityProfile: any) {
        try {
            return await db.transaction(async (tx) => {
                await tx
                    .insert(identities)
                    .values({ userId: identityProfile.userId })
                    .onConflictDoNothing();

                await tx
                    .delete(identityIps)
                    .where(eq(identityIps.userId, identityProfile.userId));
                if (identityProfile.ips?.length > 0) {
                    await tx.insert(identityIps).values(
                        identityProfile.ips.map((ip: string, index: number) => ({
                            userId: identityProfile.userId,
                            ip,
                            count: identityProfile.ips_count?.[index] || 0,
                        })),
                    );
                }

                return identityProfile;
            });
        } catch (error) {
            logger.error(
                `[IdentityDAO.saveIdentityProfile] Error for userId: ${identityProfile.userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to save identity: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }
}
