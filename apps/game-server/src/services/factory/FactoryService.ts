import FactoryDAO from "@/daos/factory.js";
import ProfileService from "@/services/mainProfile/ProfileService.js";
import { turnTimeInMsToGemsToBePaid } from "@/utils/index.js";
import {
    FACTORY_BUILDING_PADS,
    FactoryItem,
    FACTORY_ITEMS_COST_INFO,
    FactoryLevel,
    FACTORY_MAX_BUILDING_PADS,
    FACTORY_MAX_LEVEL,
    FACTORY_UPGRADE_INFO,
    PadId,
    FactorySecondaryItemIndex,
    FactorySpaceShipSecondaryItemId,
    FACTORY_BUILT_ITEM_IDS,
    FACTORY_SPACESHIP_SECONDARY_ITEM_IDS,
} from "@/constants/factory.js";
import LabService from "@/services/lab/LabService.js";
import _ from "lodash";
import logger from "@/utils/logger.js";
import { ERRORS } from "@/common/errors/appError.js";
import { LAB_ITEMS_UPGRADE_INFO } from "@/constants/index.js";

/**
 * Service for Factory-related operations.
 * Backed by PostgreSQL via FactoryDAO (drizzle-orm).
 */
export default class FactoryService {
    static async upgradeFactoryStart(userId: string): Promise<string> {
        try {
            const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);

            if (!factoryProfile) {
                throw ERRORS.NOT_FOUND("Factory not found");
            }

            if (factoryProfile.factory_upgrade_timer !== "") {
                throw ERRORS.VALIDATION("Upgrade already in progress");
            }

            if (factoryProfile.level === FACTORY_MAX_LEVEL) {
                throw ERRORS.VALIDATION("Max level reached");
            }

            if (factoryProfile.builder_pad_building_timers.some((t) => t !== "")) {
                throw ERRORS.VALIDATION("An item is currently being built");
            }

            const newLevel = (factoryProfile.level + 1) as FactoryLevel;
            const coinsToBePaid = FACTORY_UPGRADE_INFO[newLevel].coinCost;

            await ProfileService.deductCoins(userId, coinsToBePaid);

            factoryProfile.factory_upgrade_timer = new Date().toISOString();

            await FactoryDAO.saveFactoryProfile(factoryProfile);
            return factoryProfile.factory_upgrade_timer;
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            logger.error(`[FactoryService.upgradeFactoryStart] Error for userId: ${userId}`, { error });
            throw ERRORS.DB_ERROR(`Failed to start factory upgrade: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    static async upgradeFactoryEnd(userId: string, skipWithGem: boolean) {
        try {
            const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);

            if (!factoryProfile) throw ERRORS.NOT_FOUND("Factory not found");
            if (factoryProfile.factory_upgrade_timer === "") throw ERRORS.VALIDATION("Upgrade isn't in progress");
            if (factoryProfile.level === FACTORY_MAX_LEVEL) throw ERRORS.VALIDATION("Max level reached");

            const newLevel = (factoryProfile.level + 1) as FactoryLevel;
            const timeToWait = FACTORY_UPGRADE_INFO[newLevel].time;
            const now = new Date();
            const startTime = new Date(factoryProfile.factory_upgrade_timer);
            const passedTime = Math.floor(now.getTime() - startTime.getTime());

            if (passedTime < 0) throw ERRORS.VALIDATION("Invalid time");

            if (skipWithGem) {
                if (passedTime >= timeToWait) throw ERRORS.VALIDATION("Already ended");
                const gemsToBePaid = turnTimeInMsToGemsToBePaid(timeToWait - passedTime);
                await ProfileService.deductGems(userId, gemsToBePaid);
            } else {
                if (passedTime < timeToWait) throw ERRORS.VALIDATION("Not enough time passed");
            }

            factoryProfile.level = newLevel;
            factoryProfile.factory_upgrade_timer = "";

            await FactoryDAO.saveFactoryProfile(factoryProfile);
            return factoryProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            logger.error(`[FactoryService.upgradeFactoryEnd] Error for userId: ${userId}`, { error });
            throw ERRORS.DB_ERROR(`Failed to end factory upgrade: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    static async buildItemStart(
        userId: string,
        itemId: FactoryItem,
        padId: PadId,
        secondaryItemId?: FactorySecondaryItemIndex,
    ): Promise<string> {
        try {
            const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);

            if (!factoryProfile) throw ERRORS.NOT_FOUND("Factory not found");
            if (padId < 0 || padId >= FACTORY_MAX_BUILDING_PADS) throw ERRORS.VALIDATION("Invalid padId");
            if (factoryProfile.builder_pad_building_timers[padId] !== "") throw ERRORS.VALIDATION("Pad is already building");
            if (factoryProfile.factory_upgrade_timer !== "") throw ERRORS.VALIDATION("Factory is being upgraded");
            if (!FACTORY_BUILT_ITEM_IDS.includes(itemId)) throw ERRORS.VALIDATION("Invalid itemId");

            if (itemId === "spaceship") {
                if (_.isNil(secondaryItemId)) throw ERRORS.VALIDATION("secondaryItemId is required");
                if (!FACTORY_SPACESHIP_SECONDARY_ITEM_IDS.includes(secondaryItemId as FactorySpaceShipSecondaryItemId)) {
                    throw ERRORS.VALIDATION("Invalid secondaryItemId");
                }
            }

            const currentLevel = factoryProfile.level;
            if (padId === 0 && currentLevel < FACTORY_BUILDING_PADS.pad1.minLevel) throw ERRORS.VALIDATION("Invalid padId");
            if (padId === 1 && currentLevel < FACTORY_BUILDING_PADS.pad2.minLevel) throw ERRORS.VALIDATION("Invalid padId");
            if (padId === 2 && currentLevel < FACTORY_BUILDING_PADS.pad3.minLevel) throw ERRORS.VALIDATION("Invalid padId");

            if (itemId === "rocket" && factoryProfile.rockets >= FACTORY_ITEMS_COST_INFO.rocket.maxCount) throw ERRORS.VALIDATION("Max count reached");
            else if (itemId === "spaceship" && factoryProfile.spaceships.filter((i) => i !== -1).length >= FACTORY_ITEMS_COST_INFO.spaceship.maxCount) throw ERRORS.VALIDATION("Max count reached");
            else if (itemId === "explorer" && factoryProfile.explorers >= FACTORY_ITEMS_COST_INFO.explorer.maxCount) throw ERRORS.VALIDATION("Max count reached");
            else if (itemId === "satellite" && factoryProfile.satellites >= FACTORY_ITEMS_COST_INFO.satellite.maxCount) throw ERRORS.VALIDATION("Max count reached");
            else if (itemId === "wormhole" && factoryProfile.wormhole >= FACTORY_ITEMS_COST_INFO.wormhole.maxCount) throw ERRORS.VALIDATION("Max count reached");
            else if (itemId === "astroidDigger" && factoryProfile.astroidDiggers >= FACTORY_ITEMS_COST_INFO.astroidDigger.maxCount) throw ERRORS.VALIDATION("Max count reached");
            else if (itemId === "cyborg" && factoryProfile.cyborg >= FACTORY_ITEMS_COST_INFO.cyborg.maxCount) throw ERRORS.VALIDATION("Max count reached");
            else if (itemId === "dysonSphere" && factoryProfile.dysonSphere >= FACTORY_ITEMS_COST_INFO.dysonSphere.maxCount) throw ERRORS.VALIDATION("Max count reached");

            const doesItemHasTheTech = await LabService.checkIfItemFromFactoryHasTheTech(userId, itemId);
            if (!doesItemHasTheTech) throw ERRORS.VALIDATION("Item doesn't have the tech");

            await ProfileService.deductMineralAndCoin(userId, FACTORY_ITEMS_COST_INFO[itemId].mineralCost, FACTORY_ITEMS_COST_INFO[itemId].coinCost);

            factoryProfile.builder_pad_building_timers[padId] = new Date().toISOString();
            if (itemId === "spaceship") {
                factoryProfile.builder_pad_items_being_built_secondary[padId] = secondaryItemId as FactorySecondaryItemIndex;
            }
            factoryProfile.builder_pad_items_being_built[padId] = itemId;

            await FactoryDAO.saveFactoryProfile(factoryProfile);
            return factoryProfile.builder_pad_building_timers[padId];
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            logger.error(`[FactoryService.buildItemStart] Error for userId: ${userId}, itemId: ${itemId}, padId: ${padId}`, { error });
            throw ERRORS.DB_ERROR(`Failed to start building item: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    static async buildItemEnd(userId: string, itemId: FactoryItem, padId: PadId, skipWithGem: boolean) {
        try {
            const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);

            if (!factoryProfile) throw ERRORS.NOT_FOUND("Factory not found");
            if (padId < 0 || padId >= FACTORY_MAX_BUILDING_PADS) throw ERRORS.VALIDATION("Invalid padId");
            if (factoryProfile.builder_pad_building_timers[padId] === "") throw ERRORS.VALIDATION("Pad is inactive");
            if (!FACTORY_BUILT_ITEM_IDS.includes(itemId)) throw ERRORS.VALIDATION("Invalid itemId");
            if (factoryProfile.builder_pad_items_being_built[padId] !== itemId) throw ERRORS.VALIDATION("Invalid itemId");

            const timeToWait = FACTORY_ITEMS_COST_INFO[itemId].time;
            const now = new Date();
            const startTime = new Date(factoryProfile.builder_pad_building_timers[padId]);
            const passedTime = Math.floor(now.getTime() - startTime.getTime());

            if (passedTime < 0) throw ERRORS.VALIDATION("Invalid time");

            if (skipWithGem) {
                if (passedTime >= timeToWait) throw ERRORS.VALIDATION("Already ended");
                await ProfileService.deductGems(userId, turnTimeInMsToGemsToBePaid(timeToWait - passedTime));
            } else {
                if (passedTime < timeToWait) throw ERRORS.VALIDATION("Not enough time passed");
            }

            if (itemId === "rocket") factoryProfile.rockets++;
            else if (itemId === "spaceship") factoryProfile.spaceships.push(factoryProfile.builder_pad_items_being_built_secondary[padId]);
            else if (itemId === "explorer") factoryProfile.explorers++;
            else if (itemId === "satellite") factoryProfile.satellites++;
            else if (itemId === "wormhole") factoryProfile.wormhole++;
            else if (itemId === "astroidDigger") factoryProfile.astroidDiggers++;
            else if (itemId === "cyborg") factoryProfile.cyborg++;
            else if (itemId === "dysonSphere") factoryProfile.dysonSphere++;

            factoryProfile.builder_pad_building_timers[padId] = "";
            factoryProfile.builder_pad_items_being_built[padId] = "";
            factoryProfile.builder_pad_items_being_built_secondary[padId] = -1;

            await FactoryDAO.saveFactoryProfile(factoryProfile);
            return factoryProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            logger.error(`[FactoryService.buildItemEnd] Error for userId: ${userId}, itemId: ${itemId}, padId: ${padId}`, { error });
            throw ERRORS.DB_ERROR(`Failed to complete building item: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    static async deductItemForLaunchSite(
        userId: string,
        itemId: FactoryItem,
        updateType: "beforeLaunch" | "afterLaunch" = "beforeLaunch",
    ): Promise<void> {
        try {
            const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);
            if (!factoryProfile) throw ERRORS.NOT_FOUND("Factory not found");

            const labProfile = await LabService.getLabProfile(userId);

            if (factoryProfile.rockets <= 0) throw ERRORS.VALIDATION("No rockets to launch");

            if (updateType === "afterLaunch") {
                if (_.isNil(LAB_ITEMS_UPGRADE_INFO.rocketTech.minimumForRocketReusability)) {
                    throw ERRORS.NOT_FOUND("config is missing for rocketTech.minimumForRocketReusability");
                }
                if (labProfile.rocketTech >= LAB_ITEMS_UPGRADE_INFO.rocketTech.minimumForRocketReusability) {
                    factoryProfile.rockets++;
                }
                if (itemId === "astroidDigger") {
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
                } else if (itemId === "astroidDigger") {
                    if (factoryProfile.astroidDiggers <= 0) throw ERRORS.VALIDATION("No astroids to launch");
                    factoryProfile.astroidDiggers--;
                } else if (itemId === "cyborg") {
                    if (factoryProfile.cyborg <= 0) throw ERRORS.VALIDATION("No cyborgs to launch");
                    factoryProfile.cyborg--;
                } else if (itemId === "dysonSphere") {
                    if (factoryProfile.dysonSphere <= 0) throw ERRORS.VALIDATION("No dyson spheres to launch");
                    factoryProfile.dysonSphere--;
                } else {
                    throw ERRORS.VALIDATION("Invalid itemId");
                }
            }

            await FactoryDAO.saveFactoryProfile(factoryProfile);
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            logger.error(`[FactoryService.deductItemForLaunchSite] Error for userId: ${userId}, itemId: ${itemId}`, { error });
            throw ERRORS.DB_ERROR(`Failed to deduct item for launch site: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
