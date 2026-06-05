import { db } from "./connection.js";
import { labs } from "../models/schema.js";
import { eq } from "drizzle-orm";
import logger from "@/utils/logger.js";
import { ERRORS } from "@/common/errors/appError.js";

/**
 * Data Access Object for Lab-related operations using PostgreSQL.
 */
export default class LabDAO {
    static async createLab(LabInfo: any) {
        try {
            await db.insert(labs).values({
                userId: LabInfo.userId,
                level: LabInfo.level,
                labUpgradeTimer: LabInfo.lab_upgrade_timer ? new Date(LabInfo.lab_upgrade_timer) : null,
                factoryTech: LabInfo.factoryTech,
                energyGeneratorTech: LabInfo.energyGeneratorTech,
                rocketTech: LabInfo.rocketTech,
                miningTech: LabInfo.miningTech,
                portalTech: LabInfo.portalTech,
                generalTech: LabInfo.generalTech
            }).onConflictDoUpdate({
                target: labs.userId,
                set: {
                    level: LabInfo.level,
                    labUpgradeTimer: LabInfo.lab_upgrade_timer ? new Date(LabInfo.lab_upgrade_timer) : null,
                    factoryTech: LabInfo.factoryTech,
                    energyGeneratorTech: LabInfo.energyGeneratorTech,
                    rocketTech: LabInfo.rocketTech,
                    miningTech: LabInfo.miningTech,
                    portalTech: LabInfo.portalTech,
                    generalTech: LabInfo.generalTech
                }
            });
            return LabInfo;
        } catch (error) {
            logger.error(`[LabDAO.createLab] Error for userId: ${LabInfo.userId}`, { error });
            throw ERRORS.DB_ERROR(
                `Failed to create lab: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    static async findLabByUserId(userId: string) {
        try {
            const res = await db.query.labs.findFirst({ where: eq(labs.userId, userId) });
            if (!res) return null;
            return {
                userId: res.userId,
                level: res.level,
                lab_upgrade_timer: res.labUpgradeTimer?.toISOString() || "",
                factoryTech: res.factoryTech,
                energyGeneratorTech: res.energyGeneratorTech,
                rocketTech: res.rocketTech,
                miningTech: res.miningTech,
                portalTech: res.portalTech,
                generalTech: res.generalTech
            };
        } catch (error) {
            logger.error(`[LabDAO.findLabByUserId] Error for userId: ${userId}`, { error });
            throw ERRORS.DB_ERROR(
                `Failed to fetch lab: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    static async saveLabProfile(labProfile: any) {
        try {
            await db.insert(labs).values({
                userId: labProfile.userId,
                level: labProfile.level,
                labUpgradeTimer: labProfile.lab_upgrade_timer ? new Date(labProfile.lab_upgrade_timer) : null,
                factoryTech: labProfile.factoryTech,
                energyGeneratorTech: labProfile.energyGeneratorTech,
                rocketTech: labProfile.rocketTech,
                miningTech: labProfile.miningTech,
                portalTech: labProfile.portalTech,
                generalTech: labProfile.generalTech
            }).onConflictDoUpdate({
                target: labs.userId,
                set: {
                    level: labProfile.level,
                    labUpgradeTimer: labProfile.lab_upgrade_timer ? new Date(labProfile.lab_upgrade_timer) : null,
                    factoryTech: labProfile.factoryTech,
                    energyGeneratorTech: labProfile.energyGeneratorTech,
                    rocketTech: labProfile.rocketTech,
                    miningTech: labProfile.miningTech,
                    portalTech: labProfile.portalTech,
                    generalTech: labProfile.generalTech
                }
            });
            return labProfile;
        } catch (error) {
            logger.error(`[LabDAO.saveLabProfile] Error for userId: ${labProfile.userId}`, { error });
            throw ERRORS.DB_ERROR(
                `Failed to save lab: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }
}
