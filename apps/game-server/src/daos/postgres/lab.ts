import { db } from "./connection.js";
import { labs } from "@/models/postgres/schema.js";
import { eq } from "drizzle-orm";
import logger from "@/utils/logger.js";
import { ERRORS } from "@/common/errors/appError.js";

/**
 * Data Access Object for Lab-related operations using PostgreSQL.
 */
export default class LabDAO {
    static async createLab(LabInfo: any) {
        try {
            await db
                .insert(labs)
                .values({
                    user_id: LabInfo.userId,
                    level: LabInfo.level,
                    lab_upgrade_timer: LabInfo.lab_upgrade_timer
                        ? new Date(LabInfo.lab_upgrade_timer)
                        : null,
                    factory_tech: LabInfo.factoryTech,
                    energy_generator_tech: LabInfo.energyGeneratorTech,
                    rocket_tech: LabInfo.rocketTech,
                    mining_tech: LabInfo.miningTech,
                    portal_tech: LabInfo.portalTech,
                    general_tech: LabInfo.generalTech,
                })
                .onConflictDoUpdate({
                    target: labs.user_id,
                    set: {
                        level: LabInfo.level,
                        lab_upgrade_timer: LabInfo.lab_upgrade_timer
                            ? new Date(LabInfo.lab_upgrade_timer)
                            : null,
                        factory_tech: LabInfo.factoryTech,
                        energy_generator_tech: LabInfo.energyGeneratorTech,
                        rocket_tech: LabInfo.rocketTech,
                        mining_tech: LabInfo.miningTech,
                        portal_tech: LabInfo.portalTech,
                        general_tech: LabInfo.generalTech,
                    },
                });
            return LabInfo;
        } catch (error) {
            logger.error(
                `[LabDAO.createLab] Error for userId: ${LabInfo.userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to create lab: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    static async findLabByUserId(userId: string) {
        try {
            const res = await db.query.labs.findFirst({
                where: eq(labs.user_id, userId),
            });
            if (!res) return null;
            return {
                userId: res.user_id,
                level: res.level,
                lab_upgrade_timer: res.lab_upgrade_timer?.toISOString() || "",
                factoryTech: res.factory_tech,
                energyGeneratorTech: res.energy_generator_tech,
                rocketTech: res.rocket_tech,
                miningTech: res.mining_tech,
                portalTech: res.portal_tech,
                generalTech: res.general_tech,
            };
        } catch (error) {
            logger.error(
                `[LabDAO.findLabByUserId] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to fetch lab: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    static async saveLabProfile(labProfile: any) {
        try {
            await db
                .insert(labs)
                .values({
                    user_id: labProfile.userId,
                    level: labProfile.level,
                    lab_upgrade_timer: labProfile.lab_upgrade_timer
                        ? new Date(labProfile.lab_upgrade_timer)
                        : null,
                    factory_tech: labProfile.factoryTech,
                    energy_generator_tech: labProfile.energyGeneratorTech,
                    rocket_tech: labProfile.rocketTech,
                    mining_tech: labProfile.miningTech,
                    portal_tech: labProfile.portalTech,
                    general_tech: labProfile.generalTech,
                })
                .onConflictDoUpdate({
                    target: labs.user_id,
                    set: {
                        level: labProfile.level,
                        lab_upgrade_timer: labProfile.lab_upgrade_timer
                            ? new Date(labProfile.lab_upgrade_timer)
                            : null,
                        factory_tech: labProfile.factoryTech,
                        energy_generator_tech: labProfile.energyGeneratorTech,
                        rocket_tech: labProfile.rocketTech,
                        mining_tech: labProfile.miningTech,
                        portal_tech: labProfile.portalTech,
                        general_tech: labProfile.generalTech,
                    },
                });
            return labProfile;
        } catch (error) {
            logger.error(
                `[LabDAO.saveLabProfile] Error for userId: ${labProfile.userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to save lab: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }
}
