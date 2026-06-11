import { db } from "./connection.js";
import { energyGenerators } from "@/models/postgres/schema.ts";
import { eq } from "drizzle-orm";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";

/**
 * Data Access Object for Energy Generator operations using PostgreSQL.
 */
export default class EnergyGeneratorDAO {
    static async createEnergyGenerator(energyGeneratorData: any) {
        try {
            await db
                .insert(energyGenerators)
                .values({
                    user_id: energyGeneratorData.userId,
                    panel_count: energyGeneratorData.panel_count,
                    level: energyGeneratorData.level,
                    upgrade_timer: energyGeneratorData.upgrade_timer
                        ? new Date(energyGeneratorData.upgrade_timer)
                        : null,
                })
                .onConflictDoUpdate({
                    target: energyGenerators.user_id,
                    set: {
                        panel_count: energyGeneratorData.panel_count,
                        level: energyGeneratorData.level,
                        upgrade_timer: energyGeneratorData.upgrade_timer
                            ? new Date(energyGeneratorData.upgrade_timer)
                            : null,
                    },
                });
            return energyGeneratorData;
        } catch (error) {
            logger.error(
                `[EnergyGeneratorDAO.createEnergyGenerator] Error for userId: ${energyGeneratorData.userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to create energy generator: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    static async findEnergyGeneratorByUserId(userId: string) {
        try {
            const res = await db.query.energyGenerators.findFirst({
                where: eq(energyGenerators.user_id, userId),
            });
            if (!res) return null;
            return {
                userId: res.user_id,
                panel_count: res.panel_count,
                level: res.level,
                upgrade_timer: res.upgrade_timer?.toISOString() || "",
            };
        } catch (error) {
            logger.error(
                `[EnergyGeneratorDAO.findEnergyGeneratorByUserId] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to fetch energy generator: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    static async saveEnergyGeneratorProfile(
        energyGeneratorProfile: any
    ): Promise<any> {
        try {
            await db
                .insert(energyGenerators)
                .values({
                    user_id: energyGeneratorProfile.userId,
                    panel_count: energyGeneratorProfile.panel_count,
                    level: energyGeneratorProfile.level,
                    upgrade_timer: energyGeneratorProfile.upgrade_timer
                        ? new Date(energyGeneratorProfile.upgrade_timer)
                        : null,
                })
                .onConflictDoUpdate({
                    target: energyGenerators.user_id,
                    set: {
                        panel_count: energyGeneratorProfile.panel_count,
                        level: energyGeneratorProfile.level,
                        upgrade_timer: energyGeneratorProfile.upgrade_timer
                            ? new Date(energyGeneratorProfile.upgrade_timer)
                            : null,
                    },
                });
            return energyGeneratorProfile;
        } catch (error) {
            logger.error(
                `[EnergyGeneratorDAO.saveEnergyGeneratorProfile] Error for userId: ${energyGeneratorProfile.userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to save energy generator: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }
}
