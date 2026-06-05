import LabDAO from "@/daos/lab.js";
import ProfileService from "@/services/mainProfile/ProfileService.js";
import { turnTimeInMsToGemsToBePaid } from "@/utils/index.js";
import {
    LAB_FACTORY_ITEMS_UPGRADE_INFO,
    LAB_ITEMS_UPGRADE_INFO,
    LabLevel,
    LAB_MAX_LEVEL,
    LAB_UPGRADE_INFO,
    LabUpgradeItem,
} from "@/constants/lab.js";
import { FactoryItem } from "@/constants/index.js";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";

/**
 * Service for Lab-related operations.
 * Backed by PostgreSQL via LabDAO (drizzle-orm).
 */
export default class LabService {
    static async getLabProfile(userId: string) {
        const labProfile = await LabDAO.findLabByUserId(userId);
        if (!labProfile) {
            throw ERRORS.NOT_FOUND("Lab not found");
        }
        return labProfile;
    }

    static async upgradeLabStart(userId: string): Promise<string> {
        try {
            const labProfile = await LabDAO.findLabByUserId(userId);

            if (!labProfile) {
                throw ERRORS.NOT_FOUND("Lab not found");
            }

            if (labProfile.lab_upgrade_timer !== "") {
                throw ERRORS.VALIDATION("Upgrade already in progress");
            }

            if (labProfile.level === LAB_MAX_LEVEL) {
                throw ERRORS.VALIDATION("Max level reached");
            }

            const newLevel = (labProfile.level + 1) as LabLevel;
            const coinsToBePaid = LAB_UPGRADE_INFO[newLevel].coinCost;

            await ProfileService.deductCoins(userId, coinsToBePaid);

            const now = new Date();
            labProfile.lab_upgrade_timer = now.toISOString();

            await LabDAO.saveLabProfile(labProfile);
            return labProfile.lab_upgrade_timer;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[LabService.upgradeLabStart] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to start lab upgrade: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    static async upgradeLabEnd(userId: string, skipWithGem: boolean) {
        try {
            const labProfile = await LabDAO.findLabByUserId(userId);

            if (!labProfile) {
                throw ERRORS.NOT_FOUND("Lab not found");
            }

            if (labProfile.lab_upgrade_timer === "") {
                throw ERRORS.VALIDATION("Upgrade is not in progress");
            }

            if (labProfile.level === LAB_MAX_LEVEL) {
                throw ERRORS.VALIDATION("Max level reached");
            }

            const newLevel = (labProfile.level + 1) as LabLevel;
            const timeToWait = LAB_UPGRADE_INFO[newLevel].time;

            const now = new Date();
            const startTime = new Date(labProfile.lab_upgrade_timer);
            const passedTime = Math.floor(now.getTime() - startTime.getTime());

            if (passedTime < 0) {
                throw ERRORS.VALIDATION("Invalid time");
            }

            if (skipWithGem) {
                if (passedTime >= timeToWait) {
                    throw ERRORS.VALIDATION("Already ended");
                }
                const remainingTime = timeToWait - passedTime;
                const gemsToBePaid = turnTimeInMsToGemsToBePaid(remainingTime);
                await ProfileService.deductGems(userId, gemsToBePaid);
            } else {
                if (passedTime < timeToWait) {
                    throw ERRORS.VALIDATION("Not enough time passed");
                }
            }

            labProfile.level = newLevel;
            labProfile.lab_upgrade_timer = "";

            await LabDAO.saveLabProfile(labProfile);
            return labProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[LabService.upgradeLabEnd] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to complete lab upgrade: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    static async upgradeItem(userId: string, itemId: LabUpgradeItem) {
        try {
            const labProfile = await LabDAO.findLabByUserId(userId);

            if (!labProfile) {
                throw ERRORS.NOT_FOUND("Lab not found");
            }

            if (labProfile.lab_upgrade_timer !== "") {
                throw ERRORS.VALIDATION("Lab is being upgraded");
            }

            const currentLevel = labProfile.level;
            const currentItemLevel = labProfile[itemId] as number;
            const targetItemLevel = currentItemLevel + 1;

            if (currentLevel < targetItemLevel) {
                throw ERRORS.VALIDATION("First upgrade the lab");
            }

            const itemMaxLevel = LAB_ITEMS_UPGRADE_INFO[itemId].maxStep;

            if (itemMaxLevel < targetItemLevel) {
                throw ERRORS.VALIDATION("already upgraded to Max level");
            }

            const coinsToBePaid =
                LAB_ITEMS_UPGRADE_INFO.CostsForSteps[targetItemLevel].coins;
            const mineralsToBePaid =
                LAB_ITEMS_UPGRADE_INFO.CostsForSteps[targetItemLevel].minerals;

            await ProfileService.deductMineralAndCoin(
                userId,
                mineralsToBePaid,
                coinsToBePaid,
            );

            labProfile[itemId] = targetItemLevel;

            await LabDAO.saveLabProfile(labProfile);
            return labProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[LabService.upgradeItem] Error for userId: ${userId}, itemId: ${itemId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to upgrade lab item: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    static async checkIfItemFromFactoryHasTheTech(
        userId: string,
        itemId: FactoryItem,
    ): Promise<boolean> {
        try {
            const labProfile = await LabDAO.findLabByUserId(userId);

            if (!labProfile) {
                throw ERRORS.NOT_FOUND("lab profile not found");
            }

            const minLevelToBuildTargetItem =
                LAB_FACTORY_ITEMS_UPGRADE_INFO[itemId].minTechToBuild;
            const currentLevelOfFactory = labProfile.factoryTech;

            return currentLevelOfFactory >= minLevelToBuildTargetItem;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[LabService.checkIfItemFromFactoryHasTheTech] Error for userId: ${userId}, itemId: ${itemId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to check factory item tech requirement: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }
}
