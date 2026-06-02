import { LabDAO } from "@/daos/postgres/lab.js";
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
import _ from "lodash";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";

export default class LabService {
    static async getLabProfile(userId: string): Promise<any> {
        const labProfile = await LabDAO.findLabByUserId(userId);
        if (!labProfile) throw ERRORS.NOT_FOUND("Lab not found");
        return labProfile;
    }

    static async upgradeLabStart(userId: string): Promise<string> {
        try {
            const labProfile = await LabDAO.findLabByUserId(userId);
            if (!labProfile) throw ERRORS.NOT_FOUND("Lab not found");
            if (labProfile.lab_upgrade_timer !== "") throw ERRORS.VALIDATION("Upgrade already in progress");
            if (labProfile.level >= LAB_MAX_LEVEL) throw ERRORS.VALIDATION("Max level reached");

            const newLevel = (labProfile.level + 1) as LabLevel;
            const coinsToBePaid = LAB_UPGRADE_INFO[newLevel].coinCost;

            await ProfileService.deductCoins(userId, coinsToBePaid);

            labProfile.lab_upgrade_timer = new Date().toUTCString();
            await LabDAO.saveLabProfile(labProfile);
            return labProfile.lab_upgrade_timer;
        } catch (error) {
            throw error;
        }
    }

    static async upgradeLabEnd(userId: string, skipWithGem: boolean): Promise<any> {
        try {
            const labProfile = await LabDAO.findLabByUserId(userId);
            if (!labProfile) throw ERRORS.NOT_FOUND("Lab not found");
            if (labProfile.lab_upgrade_timer === "") throw ERRORS.VALIDATION("Upgrade not in progress");

            const newLevel = (labProfile.level + 1) as LabLevel;
            const timeToWait = LAB_UPGRADE_INFO[newLevel].time;
            const startTime = new Date(labProfile.lab_upgrade_timer);
            const passedTime = Date.now() - startTime.getTime();

            if (skipWithGem) {
                const remainingTime = Math.max(0, timeToWait - passedTime);
                const gemsToPay = turnTimeInMsToGemsToBePaid(remainingTime);
                await ProfileService.deductGems(userId, gemsToPay);
            } else {
                if (passedTime < timeToWait) throw ERRORS.VALIDATION("Not enough time passed");
            }

            labProfile.level = newLevel;
            labProfile.lab_upgrade_timer = "";
            await LabDAO.saveLabProfile(labProfile);
            return labProfile;
        } catch (error) {
            throw error;
        }
    }

    static async upgradeItem(userId: string, itemId: LabUpgradeItem): Promise<any> {
        try {
            const labProfile = await LabDAO.findLabByUserId(userId);
            if (!labProfile) throw ERRORS.NOT_FOUND("Lab not found");
            if (labProfile.lab_upgrade_timer !== "") throw ERRORS.VALIDATION("Lab is being upgraded");

            const currentLevel = labProfile.level;
            const currentItemLevel = (labProfile as any)[itemId];
            const targetItemLevel = currentItemLevel + 1;

            if (currentLevel < targetItemLevel) throw ERRORS.VALIDATION("First upgrade the lab");

            const itemMaxLevel = (LAB_ITEMS_UPGRADE_INFO as any)[itemId].maxStep;
            if (itemMaxLevel < targetItemLevel) throw ERRORS.VALIDATION("Already at max level");

            const { coins, minerals } = (LAB_ITEMS_UPGRADE_INFO as any).CostsForSteps[targetItemLevel];
            await ProfileService.deductMineralAndCoin(userId, minerals, coins);

            (labProfile as any)[itemId] = targetItemLevel;
            if (itemId === "miningTech") await ProfileService.updateMineralGenerationRate(userId);
            await LabDAO.saveLabProfile(labProfile);
            return labProfile;
        } catch (error) {
            throw error;
        }
    }

    static async checkIfItemFromFactoryHasTheTech(userId: string, itemId: FactoryItem): Promise<boolean> {
        try {
            const labProfile = await LabDAO.findLabByUserId(userId);
            if (!labProfile) return false;
            const minLevelToBuildTargetItem = LAB_FACTORY_ITEMS_UPGRADE_INFO[itemId].minTechToBuild;
            return labProfile.factoryTech >= minLevelToBuildTargetItem;
        } catch (error) {
            return false;
        }
    }
}
