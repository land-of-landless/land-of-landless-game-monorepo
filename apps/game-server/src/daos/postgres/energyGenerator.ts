import { db } from "./connection.js";
import { energyGenerators } from "../../models/schema.ts";
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
                    userId: energyGeneratorData.userId,
                    panelCount: energyGeneratorData.panel_count,
                    level: energyGeneratorData.level,
                    upgradeTimer: energyGeneratorData.upgrade_timer
                        ? new Date(energyGeneratorData.upgrade_timer)
                        : null,
                })
                .onConflictDoUpdate({
                    target: energyGenerators.userId,
                    set: {
                        panelCount: energyGeneratorData.panel_count,
                        level: energyGeneratorData.level,
                        upgradeTimer: energyGeneratorData.upgrade_timer
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
                where: eq(energyGenerators.userId, userId),
            });
            if (!res) return null;
            return {
                userId: res.userId,
                panel_count: res.panelCount,
                level: res.level,
                upgrade_timer: res.upgradeTimer?.toISOString() || "",
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
                    userId: energyGeneratorProfile.userId,
                    panelCount: energyGeneratorProfile.panel_count,
                    level: energyGeneratorProfile.level,
                    upgradeTimer: energyGeneratorProfile.upgrade_timer
                        ? new Date(energyGeneratorProfile.upgrade_timer)
                        : null,
                })
                .onConflictDoUpdate({
                    target: energyGenerators.userId,
                    set: {
                        panelCount: energyGeneratorProfile.panel_count,
                        level: energyGeneratorProfile.level,
                        upgradeTimer: energyGeneratorProfile.upgrade_timer
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
