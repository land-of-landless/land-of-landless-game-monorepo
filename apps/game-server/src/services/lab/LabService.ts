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
        const labProfile = await LabDAO.findLabByUserId(userId);
        if (!labProfile) throw ERRORS.NOT_FOUND("Lab not found");
        // ... implementation
        await LabDAO.saveLabProfile(labProfile);
        return "";
    }

    static async upgradeLabEnd(userId: string, skipWithGem: boolean): Promise<any> {
        const labProfile = await LabDAO.findLabByUserId(userId);
        if (!labProfile) throw ERRORS.NOT_FOUND("Lab not found");
        // ... implementation
        await LabDAO.saveLabProfile(labProfile);
        return labProfile;
    }

    static async upgradeItem(userId: string, itemId: LabUpgradeItem): Promise<any> {
        const labProfile = await LabDAO.findLabByUserId(userId);
        if (!labProfile) throw ERRORS.NOT_FOUND("Lab not found");
        // ... implementation
        await LabDAO.saveLabProfile(labProfile);
        return labProfile;
    }

    static async checkIfItemFromFactoryHasTheTech(userId: string, itemId: FactoryItem): Promise<boolean> {
        const labProfile = await LabDAO.findLabByUserId(userId);
        if (!labProfile) return false;
        const minLevelToBuildTargetItem = LAB_FACTORY_ITEMS_UPGRADE_INFO[itemId].minTechToBuild;
        return labProfile.factoryTech >= minLevelToBuildTargetItem;
    }
}
