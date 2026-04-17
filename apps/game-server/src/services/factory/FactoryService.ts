import { FactoryDAO } from "@/daos/redis/factory";
import ProfileService from "@/services/mainProfile/ProfileService";
import { turnTimeInMsToGemsToBePaid } from "@/utils";
import { Factory } from "@/models/redis/factory";
import {
    FACTORY_BUILDING_PADS,
    Factory_Item_Type,
    FACTORY_ITEMS_COST_INFO,
    FACTORY_LEVELS_INDEX,
    FACTORY_MAX_BUILDING_PADS,
    FACTORY_MAX_LEVEL,
    FACTORY_UPGRADE_INFO,
    padIdType,
    FACTORY_SECONDARY_Item_INDEX_Type,
    Factory_Rocket_Secondary_Item_Id,
    Factory_Spaceship_Secondary_Item_Id,
    Factory_Built_Item_Id,
} from "@/constants/factory";
import LabService from "@/services/lab/LabService";
import _ from "lodash";
import logger from "@/utils/logger";
import { ERRORS } from "@/common/errors/appError";
import { LAB_ITEMS_UPGRADE_INFO } from "@/constants";
import { factoryRepository } from "@/daos/redis/repositories";

/**
 * Service for Factory-related operations.
 * Handles business logic for upgrades, building items, and resource management.
 */
export default class FactoryService {
    /**
     * Starts the upgrade process for the main Factory building.
     * @param userId - The ID of the user upgrading the factory.
     * @returns The UTC string of the upgrade start time.
     */
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

            if (
                factoryProfile.builder_pad_building_timers.some(
                    (timer) => timer !== "",
                )
            ) {
                throw ERRORS.VALIDATION("An item is currently being built");
            }

            const newLevel = (factoryProfile.level + 1) as FACTORY_LEVELS_INDEX;
            const coinsToBePaid = FACTORY_UPGRADE_INFO[newLevel].coinCost;

            await ProfileService.deductCoins(userId, coinsToBePaid);

            const now = new Date();
            factoryProfile.factory_upgrade_timer = now.toUTCString();

            await factoryRepository.save(factoryProfile);
            return factoryProfile.factory_upgrade_timer;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[FactoryService.upgradeFactoryStart] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to start factory upgrade: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Completes the upgrade process for the main Factory building.
     * @param userId - The ID of the user.
     * @param skipWithGem - A boolean indicating whether to use gems to finish the upgrade instantly.
     * @returns The updated Factory entity.
     */
    static async upgradeFactoryEnd(
        userId: string,
        skipWithGem: boolean,
    ): Promise<Factory> {
        try {
            const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);

            if (!factoryProfile) {
                throw ERRORS.NOT_FOUND("Factory not found");
            }

            if (factoryProfile.factory_upgrade_timer === "") {
                throw ERRORS.VALIDATION("Upgrade isn't in progress");
            }

            if (factoryProfile.level === FACTORY_MAX_LEVEL) {
                throw ERRORS.VALIDATION("Max level reached");
            }

            const newLevel = (factoryProfile.level + 1) as FACTORY_LEVELS_INDEX;
            const timeToWait = FACTORY_UPGRADE_INFO[newLevel].time;

            const now = new Date();
            const startTime = new Date(factoryProfile.factory_upgrade_timer);
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

            factoryProfile.level = newLevel;
            factoryProfile.factory_upgrade_timer = "";

            await factoryRepository.save(factoryProfile);
            return factoryProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[FactoryService.upgradeFactoryEnd] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to end factory upgrade: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Starts the process of building a new item in a specified builder pad.
     */
    static async buildItemStart(
        userId: string,
        itemId: Factory_Item_Type,
        padId: padIdType,
        secondaryItemId?: FACTORY_SECONDARY_Item_INDEX_Type,
    ): Promise<string> {
        try {
            const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);

            if (!factoryProfile) {
                throw ERRORS.NOT_FOUND("Factory not found");
            }

            if (padId < 0 || padId >= FACTORY_MAX_BUILDING_PADS) {
                throw ERRORS.VALIDATION("Invalid padId");
            }

            if (factoryProfile.builder_pad_building_timers[padId] !== "") {
                throw ERRORS.VALIDATION("Pad is already building");
            }

            if (factoryProfile.factory_upgrade_timer !== "") {
                throw ERRORS.VALIDATION("Factory is being upgraded");
            }

            if (!Factory_Built_Item_Id.includes(itemId)) {
                throw ERRORS.VALIDATION("Invalid itemId");
            }

            if (itemId === "spaceship") {
                if (_.isNil(secondaryItemId)) {
                    throw ERRORS.VALIDATION("secondaryItemId is required");
                }

                if (
                    !Factory_Spaceship_Secondary_Item_Id.includes(
                        secondaryItemId,
                    )
                ) {
                    throw ERRORS.VALIDATION("Invalid secondaryItemId");
                }
            }

            const currentLevel = factoryProfile.level;
            const pad1MinLevel = FACTORY_BUILDING_PADS.pad1.minLevel;
            const pad2MinLevel = FACTORY_BUILDING_PADS.pad2.minLevel;
            const pad3MinLevel = FACTORY_BUILDING_PADS.pad3.minLevel;

            if (padId === 0) {
                if (currentLevel < pad1MinLevel) {
                    throw ERRORS.VALIDATION("Invalid padId");
                }
            } else if (padId === 1) {
                if (currentLevel < pad2MinLevel) {
                    throw ERRORS.VALIDATION("Invalid padId");
                }
            } else if (padId === 2) {
                if (currentLevel < pad3MinLevel) {
                    throw ERRORS.VALIDATION("Invalid padId");
                }
            }

            if (itemId === "rocket") {
                if (
                    factoryProfile.rockets >=
                    FACTORY_ITEMS_COST_INFO.rocket.maxCount
                ) {
                    throw ERRORS.VALIDATION("Max count reached");
                }
            } else if (itemId === "spaceship") {
                const numOfSpaceshipsBuilt = factoryProfile.spaceships.filter(
                    (item) => item !== -1,
                ).length;
                if (
                    numOfSpaceshipsBuilt >=
                    FACTORY_ITEMS_COST_INFO.spaceship.maxCount
                ) {
                    throw ERRORS.VALIDATION("Max count reached");
                }
            } else if (itemId === "explorer") {
                if (
                    factoryProfile.explorers >=
                    FACTORY_ITEMS_COST_INFO.explorer.maxCount
                ) {
                    throw ERRORS.VALIDATION("Max count reached");
                }
            } else if (itemId === "satellite") {
                if (
                    factoryProfile.satellites >=
                    FACTORY_ITEMS_COST_INFO.satellite.maxCount
                ) {
                    throw ERRORS.VALIDATION("Max count reached");
                }
            } else if (itemId === "wormhole") {
                if (
                    factoryProfile.wormhole >=
                    FACTORY_ITEMS_COST_INFO.wormhole.maxCount
                ) {
                    throw ERRORS.VALIDATION("Max count reached");
                }
            } else if (itemId === "astroidDigger") {
                if (
                    factoryProfile.astroidDiggers >=
                    FACTORY_ITEMS_COST_INFO.astroidDigger.maxCount
                ) {
                    throw ERRORS.VALIDATION("Max count reached");
                }
            } else if (itemId === "cyborg") {
                if (
                    factoryProfile.cyborg >=
                    FACTORY_ITEMS_COST_INFO.cyborg.maxCount
                ) {
                    throw ERRORS.VALIDATION("Max count reached");
                }
            } else if (itemId === "dysonSphere") {
                if (
                    factoryProfile.dysonSphere >=
                    FACTORY_ITEMS_COST_INFO.dysonSphere.maxCount
                ) {
                    throw ERRORS.VALIDATION("Max count reached");
                }
            }

            const doesItemHasTheTech =
                await LabService.checkIfItemFromFactoryHasTheTech(
                    userId,
                    itemId,
                );

            if (!doesItemHasTheTech) {
                throw ERRORS.VALIDATION("Item doesn't have the tech");
            }

            const coinsToBePaid = FACTORY_ITEMS_COST_INFO[itemId].coinCost;
            const mineralToBePaid = FACTORY_ITEMS_COST_INFO[itemId].mineralCost;

            await ProfileService.deductMineralAndCoin(
                userId,
                mineralToBePaid,
                coinsToBePaid,
            );

            const now = new Date();
            factoryProfile.builder_pad_building_timers[padId] =
                now.toUTCString();

            if (itemId === "spaceship") {
                factoryProfile.builder_pad_items_being_built_secondary[padId] =
                    secondaryItemId as FACTORY_SECONDARY_Item_INDEX_Type;
            }

            factoryProfile.builder_pad_items_being_built[padId] = itemId;

            await factoryRepository.save(factoryProfile);
            return factoryProfile.builder_pad_building_timers[padId];
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[FactoryService.buildItemStart] Error for userId: ${userId}, itemId: ${itemId}, padId: ${padId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to start building item: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Completes the building process for an item in a specified builder pad.
     */
    static async buildItemEnd(
        userId: string,
        itemId: Factory_Item_Type,
        padId: padIdType,
        skipWithGem: boolean,
    ): Promise<Factory> {
        try {
            const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);

            if (!factoryProfile) {
                throw ERRORS.NOT_FOUND("Factory not found");
            }

            if (padId < 0 || padId >= FACTORY_MAX_BUILDING_PADS) {
                throw ERRORS.VALIDATION("Invalid padId");
            }

            if (factoryProfile.builder_pad_building_timers[padId] === "") {
                throw ERRORS.VALIDATION("Pad is inactive");
            }

            if (!Factory_Built_Item_Id.includes(itemId)) {
                throw ERRORS.VALIDATION("Invalid itemId");
            }

            if (
                factoryProfile.builder_pad_items_being_built[padId] !== itemId
            ) {
                throw ERRORS.VALIDATION("Invalid itemId");
            }

            const timeToWait = FACTORY_ITEMS_COST_INFO[itemId].time;

            const now = new Date();
            const startTime = new Date(
                factoryProfile.builder_pad_building_timers[padId],
            );
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

            if (itemId === "rocket") {
                factoryProfile.rockets++;
            } else if (itemId === "spaceship") {
                factoryProfile.spaceships.push(
                    factoryProfile.builder_pad_items_being_built_secondary[
                        padId
                    ],
                );
            } else if (itemId === "explorer") {
                factoryProfile.explorers++;
            } else if (itemId === "satellite") {
                factoryProfile.satellites++;
            } else if (itemId === "wormhole") {
                factoryProfile.wormhole++;
            } else if (itemId === "astroidDigger") {
                factoryProfile.astroidDiggers++;
            } else if (itemId === "cyborg") {
                factoryProfile.cyborg++;
            } else if (itemId === "dysonSphere") {
                factoryProfile.dysonSphere++;
            }

            factoryProfile.builder_pad_building_timers[padId] = "";
            factoryProfile.builder_pad_items_being_built[padId] = "";
            factoryProfile.builder_pad_items_being_built_secondary[padId] = -1;

            await factoryRepository.save(factoryProfile);
            return factoryProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[FactoryService.buildItemEnd] Error for userId: ${userId}, itemId: ${itemId}, padId: ${padId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to complete building item: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }

    /**
     * Deducts an item from the factory when it's used for a launch.
     */
    static async deductItemForLaunchSite(
        userId: string,
        itemId: Factory_Item_Type,
        updateType: "beforeLaunch" | "afterLaunch" = "beforeLaunch",
    ): Promise<void> {
        try {
            const factoryProfile = await FactoryDAO.findFactoryByUserId(userId);

            if (!factoryProfile) {
                throw ERRORS.NOT_FOUND("Factory not found");
            }

            const labProfile = await LabService.getLabProfile(userId);

            if (factoryProfile.rockets <= 0) {
                throw ERRORS.VALIDATION("No rockets to launch");
            }

            if (updateType === "afterLaunch") {
                if (
                    _.isNil(
                        LAB_ITEMS_UPGRADE_INFO.rocketTech
                            .minimumForRocketReusability,
                    )
                ) {
                    throw ERRORS.NOT_FOUND(
                        "config is missing for rocketTech.minimumForRocketReusability",
                    );
                }

                if (
                    labProfile.rocketTech >=
                    LAB_ITEMS_UPGRADE_INFO.rocketTech
                        .minimumForRocketReusability
                ) {
                    factoryProfile.rockets++;
                }

                if (itemId === "astroidDigger") {
                    await ProfileService.deductAtmosphereAstroid(userId);
                }
            }

            if (updateType === "beforeLaunch") {
                factoryProfile.rockets--;

                if (itemId === "satellite") {
                    if (factoryProfile.satellites <= 0)
                        throw ERRORS.VALIDATION("No satellites to launch");
                    factoryProfile.satellites--;
                } else if (itemId === "wormhole") {
                    if (factoryProfile.wormhole <= 0)
                        throw ERRORS.VALIDATION("No wormholes to launch");
                    factoryProfile.wormhole--;
                } else if (itemId === "astroidDigger") {
                    if (factoryProfile.astroidDiggers <= 0)
                        throw ERRORS.VALIDATION("No astroids to launch");
                    factoryProfile.astroidDiggers--;
                } else if (itemId === "cyborg") {
                    if (factoryProfile.cyborg <= 0)
                        throw ERRORS.VALIDATION("No cyborgs to launch");
                    factoryProfile.cyborg--;
                } else if (itemId === "dysonSphere") {
                    if (factoryProfile.dysonSphere <= 0)
                        throw ERRORS.VALIDATION("No dyson spheres to launch");
                    factoryProfile.dysonSphere--;
                } else {
                    throw ERRORS.VALIDATION("Invalid itemId");
                }
            }

            await factoryRepository.save(factoryProfile);
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[FactoryService.deductItemForLaunchSite] Error for userId: ${userId}, itemId: ${itemId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to deduct item for launch site: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        }
    }
}
