import { labRepository } from "@/daos/redis/repositories/index";
import ProfileService from "@/services/mainProfile/ProfileService";
import { turnTimeInMsToGemsToBePaid } from "@/utils";
import {
    LAB_FACTORY_ITEMS_UPGRADE_INFO,
    LAB_ITEMS_UPGRADE_INFO,
    LAB_LEVEL_INDEX_TYPE,
    LAB_MAX_LEVEL,
    LAB_UPGRADE_INFO,
    LAB_UPGRADE_ITEM_TYPE,
} from "@/constants/lab";
import { Lab } from "@/models/redis/lab";
import { Factory_Item_Type } from "@/constants";
import _ from "lodash";
import { ERRORS } from "@/common/errors/appError";
import logger from "@/utils/logger";
import { LabDAO } from "@/daos/redis/lab";

/**
 * Service for Lab-related operations.
 * Handles business logic for upgrades, research, and technology checks.
 */
export default class LabService {
    /**
     * Retrieves the lab profile for a user.
     */
    static async getLabProfile(userId: string): Promise<Lab> {
        const labProfile = await LabDAO.findLabByUserId(userId);
        if (!labProfile) {
            throw ERRORS.NOT_FOUND("Lab not found");
        }
        return labProfile;
    }

    /**
     * Starts the upgrade process for the main Lab building.
     */
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

            const newLevel = (labProfile.level + 1) as LAB_LEVEL_INDEX_TYPE;
            const coinsToBePaid = LAB_UPGRADE_INFO[newLevel].coinCost;

            await ProfileService.deductCoins(userId, coinsToBePaid);

            const now = new Date();
            labProfile.lab_upgrade_timer = now.toUTCString();

            await labRepository.save(labProfile);
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

    /**
     * Completes the upgrade process for the main Lab building.
     */
    static async upgradeLabEnd(
        userId: string,
        skipWithGem: boolean,
    ): Promise<Lab> {
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

            const newLevel = (labProfile.level + 1) as LAB_LEVEL_INDEX_TYPE;
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

            await labRepository.save(labProfile);
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

    /**
     * Upgrades a specific technology item within the Lab.
     */
    static async upgradeItem(
        userId: string,
        itemId: LAB_UPGRADE_ITEM_TYPE,
    ): Promise<Lab> {
        try {
            const labProfile = await LabDAO.findLabByUserId(userId);

            if (!labProfile) {
                throw ERRORS.NOT_FOUND("Lab not found");
            }

            if (labProfile.lab_upgrade_timer !== "") {
                throw ERRORS.VALIDATION("Lab is being upgraded");
            }

            const currentLevel = labProfile.level;
            const targetItemLevel = labProfile[itemId] + 1;

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

            await labRepository.save(labProfile);
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

    /**
     * Checks if the user has researched the required technology in the lab to build a specific factory item.
     */
    static async checkIfItemFromFactoryHasTheTech(
        userId: string,
        itemId: Factory_Item_Type,
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
