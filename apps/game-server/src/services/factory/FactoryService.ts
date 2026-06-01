import { FactoryDAO } from "@/daos/postgres/factory.js";
import LabService from "@/services/lab/LabService.js";
import ProfileService from "@/services/mainProfile/ProfileService.js";
import {
    FACTORY_ITEMS_COST_INFO,
    FACTORY_MAX_BUILDING_PADS,
    FACTORY_BUILT_ITEM_IDS,
    FactoryItem,
    PadId,
    FactorySecondaryItemIndex,
} from "@/constants/factory.js";
import {
    LAB_ITEMS_UPGRADE_INFO,
} from "@/constants/lab.js";
import { turnTimeInMsToGemsToBePaid } from "@/utils/index.js";
import { ERRORS } from "@/common/errors/appError.js";
import logger from "@/utils/logger.js";
import _ from "lodash";

export default class FactoryService {
    static async upgradeFactoryStart(userId: string) {
        const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);
        if (!factoryProfile) throw ERRORS.NOT_FOUND("Factory not found");
        // ... implementation
        return "";
    }

    static async upgradeFactoryEnd(userId: string, skipWithGem: boolean) {
        const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);
        if (!factoryProfile) throw ERRORS.NOT_FOUND("Factory not found");
        // ... implementation
    }

    static async buildItemStart(userId: string, itemId: FactoryItem, padId: PadId, secondaryItemId: FactorySecondaryItemIndex) {
        const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);
        if (!factoryProfile) throw ERRORS.NOT_FOUND("Factory not found");
        // ... implementation
        await FactoryDAO.saveFactoryProfile(factoryProfile);
        return "";
    }

    static async buildItemEnd(userId: string, itemId: FactoryItem, padId: PadId, skipWithGem: boolean): Promise<any> {
        const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);
        if (!factoryProfile) throw ERRORS.NOT_FOUND("Factory not found");
        // ... implementation
        await FactoryDAO.saveFactoryProfile(factoryProfile);
        return factoryProfile;
    }

    static async deductItemForLaunchSite(userId: string, itemId: FactoryItem, updateType: "beforeLaunch" | "afterLaunch" = "beforeLaunch") {
        const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);
        if (!factoryProfile) throw ERRORS.NOT_FOUND("Factory not found");
        // ... implementation
        await FactoryDAO.saveFactoryProfile(factoryProfile);
    }
}
