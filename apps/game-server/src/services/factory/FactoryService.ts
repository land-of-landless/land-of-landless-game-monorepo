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
    FACTORY_UPGRADE_INFO,
    FACTORY_MAX_LEVEL,
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
        try {
            const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);
            if (!factoryProfile) throw ERRORS.NOT_FOUND("Factory not found");
            if (factoryProfile.factory_upgrade_timer !== "") throw ERRORS.VALIDATION("Upgrade already in progress");
            if (factoryProfile.level >= FACTORY_MAX_LEVEL) throw ERRORS.VALIDATION("Max level reached");

            const newLevel = (factoryProfile.level + 1) as any;
            const coinsToBePaid = (FACTORY_UPGRADE_INFO as any)[newLevel].coinCost;

            await ProfileService.deductCoins(userId, coinsToBePaid);

            factoryProfile.factory_upgrade_timer = new Date().toUTCString();
            await FactoryDAO.saveFactoryProfile(factoryProfile);
            return factoryProfile.factory_upgrade_timer;
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            throw ERRORS.DB_ERROR(`Failed to start factory upgrade: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    static async upgradeFactoryEnd(userId: string, skipWithGem: boolean) {
        try {
            const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);
            if (!factoryProfile) throw ERRORS.NOT_FOUND("Factory not found");
            if (factoryProfile.factory_upgrade_timer === "") throw ERRORS.VALIDATION("Upgrade not in progress");

            const newLevel = (factoryProfile.level + 1) as any;
            const timeToWait = (FACTORY_UPGRADE_INFO as any)[newLevel].time;
            const startTime = new Date(factoryProfile.factory_upgrade_timer);
            const passedTime = Date.now() - startTime.getTime();

            if (skipWithGem) {
                const remainingTime = Math.max(0, timeToWait - passedTime);
                const gemsToPay = turnTimeInMsToGemsToBePaid(remainingTime);
                await ProfileService.deductGems(userId, gemsToPay);
            } else {
                if (passedTime < timeToWait) throw ERRORS.VALIDATION("Not enough time passed");
            }

            factoryProfile.level = newLevel;
            factoryProfile.factory_upgrade_timer = "";
            await FactoryDAO.saveFactoryProfile(factoryProfile);
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            throw ERRORS.DB_ERROR(`Failed to complete factory upgrade: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    static async buildItemStart(userId: string, itemId: FactoryItem, padId: PadId, secondaryItemId: FactorySecondaryItemIndex) {
        try {
            const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);
            if (!factoryProfile) throw ERRORS.NOT_FOUND("Factory not found");

            if (padId < 0 || padId >= FACTORY_MAX_BUILDING_PADS) throw ERRORS.VALIDATION("Invalid padId");
            if (factoryProfile.builder_pad_building_timers[padId] !== "") throw ERRORS.VALIDATION("Pad is already active");

            if (!FACTORY_BUILT_ITEM_IDS.includes(itemId)) throw ERRORS.VALIDATION("Invalid itemId");

            // Max count checks
            const currentCount = (factoryProfile as any)[itemId === "astroidDigger" ? "astroidDiggers" : itemId];
            if (currentCount >= (FACTORY_ITEMS_COST_INFO as any)[itemId].maxCount) {
                throw ERRORS.VALIDATION("Max count reached");
            }

            const doesItemHasTheTech = await LabService.checkIfItemFromFactoryHasTheTech(userId, itemId);
            if (!doesItemHasTheTech) throw ERRORS.VALIDATION("Item doesn't have the tech");

            const { coinCost, mineralCost } = (FACTORY_ITEMS_COST_INFO as any)[itemId];
            await ProfileService.deductMineralAndCoin(userId, mineralCost, coinCost);

            const now = new Date();
            factoryProfile.builder_pad_building_timers[padId] = now.toUTCString();
            if (itemId === "spaceship") factoryProfile.builder_pad_items_being_built_secondary[padId] = secondaryItemId;
            factoryProfile.builder_pad_items_being_built[padId] = itemId;

            await FactoryDAO.saveFactoryProfile(factoryProfile);
            return factoryProfile.builder_pad_building_timers[padId];
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            throw ERRORS.DB_ERROR(`Failed to start building item: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    static async buildItemEnd(userId: string, itemId: FactoryItem, padId: PadId, skipWithGem: boolean): Promise<any> {
        try {
            const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);
            if (!factoryProfile) throw ERRORS.NOT_FOUND("Factory not found");

            if (padId < 0 || padId >= FACTORY_MAX_BUILDING_PADS) throw ERRORS.VALIDATION("Invalid padId");
            if (factoryProfile.builder_pad_building_timers[padId] === "") throw ERRORS.VALIDATION("Pad is inactive");
            if (factoryProfile.builder_pad_items_being_built[padId] !== itemId) throw ERRORS.VALIDATION("Invalid itemId");

            const timeToWait = (FACTORY_ITEMS_COST_INFO as any)[itemId].time;
            const now = new Date();
            const startTime = new Date(factoryProfile.builder_pad_building_timers[padId]);
            const passedTime = Math.floor(now.getTime() - startTime.getTime());

            if (passedTime < 0) throw ERRORS.VALIDATION("Invalid time");

            if (skipWithGem) {
                if (passedTime < timeToWait) {
                    const remainingTime = timeToWait - passedTime;
                    const gemsToBePaid = turnTimeInMsToGemsToBePaid(remainingTime);
                    await ProfileService.deductGems(userId, gemsToBePaid);
                }
            } else {
                if (passedTime < timeToWait) throw ERRORS.VALIDATION("Not enough time passed");
            }

            if (itemId === "rocket") factoryProfile.rockets++;
            else if (itemId === "spaceship") factoryProfile.spaceships.push(factoryProfile.builder_pad_items_being_built_secondary[padId]);
            else if (itemId === "explorer") {
                factoryProfile.explorers++;
                await ProfileService.updateMineralGenerationRate(userId);
            }
            else if (itemId === "satellite") factoryProfile.satellites++;
            else if (itemId === "wormhole") factoryProfile.wormhole++;
            else if (itemId === "astroidDigger" || (itemId as any) === "asteroidDigger") factoryProfile.astroidDiggers++;
            else if (itemId === "cyborg") factoryProfile.cyborg++;
            else if (itemId === "dysonSphere") factoryProfile.dysonSphere++;

            factoryProfile.builder_pad_building_timers[padId] = "";
            factoryProfile.builder_pad_items_being_built[padId] = "";
            factoryProfile.builder_pad_items_being_built_secondary[padId] = -1;

            await FactoryDAO.saveFactoryProfile(factoryProfile);
            return factoryProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            throw ERRORS.DB_ERROR(`Failed to complete building item: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    static async deductItemForLaunchSite(userId: string, itemId: FactoryItem, updateType: "beforeLaunch" | "afterLaunch" = "beforeLaunch") {
        try {
            const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);
            if (!factoryProfile) throw ERRORS.NOT_FOUND("Factory not found");

            const labProfile = await LabService.getLabProfile(userId);
            if (factoryProfile.rockets <= 0 && updateType === "beforeLaunch") throw ERRORS.VALIDATION("No rockets to launch");

            if (updateType === "afterLaunch") {
                if (labProfile.rocketTech >= (LAB_ITEMS_UPGRADE_INFO as any).rocketTech.minimumForRocketReusability) {
                    factoryProfile.rockets++;
                }
                if (itemId === ("asteroidDigger" as any) || itemId === "astroidDigger") {
                    await ProfileService.deductAtmosphereAstroid(userId);
                }
            }

            if (updateType === "beforeLaunch") {
                factoryProfile.rockets--;
                if (itemId === "satellite") {
                    if (factoryProfile.satellites <= 0) throw ERRORS.VALIDATION("No satellites to launch");
                    factoryProfile.satellites--;
                } else if (itemId === "wormhole") {
                    if (factoryProfile.wormhole <= 0) throw ERRORS.VALIDATION("No wormholes to launch");
                    factoryProfile.wormhole--;
                } else if (itemId === ("asteroidDigger" as any) || itemId === "astroidDigger") {
                    if (factoryProfile.astroidDiggers <= 0) throw ERRORS.VALIDATION("No astroids to launch");
                    factoryProfile.astroidDiggers--;
                } else if (itemId === "cyborg") {
                    if (factoryProfile.cyborg <= 0) throw ERRORS.VALIDATION("No cyborgs to launch");
                    factoryProfile.cyborg--;
                } else if (itemId === "dysonSphere") {
                    if (factoryProfile.dysonSphere <= 0) throw ERRORS.VALIDATION("No dyson spheres to launch");
                    factoryProfile.dysonSphere--;
                }
            }
            await FactoryDAO.saveFactoryProfile(factoryProfile);
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            throw ERRORS.DB_ERROR(`Failed to deduct item: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
