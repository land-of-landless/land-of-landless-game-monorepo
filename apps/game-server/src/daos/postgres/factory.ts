import { db } from "./connection.js";
import {
    factories,
    factorySpaceships,
    builderPads,
} from "../../models/schema.ts";
import { eq } from "drizzle-orm";
import logger from "@/utils/logger.js";
import { ERRORS } from "@/common/errors/appError.js";

/**
 * Data Access Object for Factory-related operations using PostgreSQL.
 */
export default class FactoryDAO {
    static async createFactory(factoryInfo: any) {
        try {
            await db.transaction(async tx => {
                await tx
                    .insert(factories)
                    .values({
                        userId: factoryInfo.userId,
                        level: factoryInfo.level,
                        factoryUpgradeTimer: factoryInfo.factory_upgrade_timer
                            ? new Date(factoryInfo.factory_upgrade_timer)
                            : null,
                        rockets: factoryInfo.rockets,
                        rocketType: factoryInfo.rocket_type,
                        explorers: factoryInfo.explorers,
                        satellites: factoryInfo.satellites,
                        wormhole: factoryInfo.wormhole,
                        astroidDiggers: factoryInfo.astroidDiggers,
                        cyborg: factoryInfo.cyborg,
                        dysonSphere: factoryInfo.dysonSphere,
                    })
                    .onConflictDoUpdate({
                        target: factories.userId,
                        set: {
                            level: factoryInfo.level,
                            factoryUpgradeTimer:
                                factoryInfo.factory_upgrade_timer
                                    ? new Date(
                                          factoryInfo.factory_upgrade_timer
                                      )
                                    : null,
                            rockets: factoryInfo.rockets,
                            rocketType: factoryInfo.rocket_type,
                            explorers: factoryInfo.explorers,
                            satellites: factoryInfo.satellites,
                            wormhole: factoryInfo.wormhole,
                            astroidDiggers: factoryInfo.astroidDiggers,
                            cyborg: factoryInfo.cyborg,
                            dysonSphere: factoryInfo.dysonSphere,
                        },
                    });

                await tx
                    .delete(factorySpaceships)
                    .where(eq(factorySpaceships.userId, factoryInfo.userId));
                if (factoryInfo.spaceships?.length > 0) {
                    await tx.insert(factorySpaceships).values(
                        factoryInfo.spaceships.map(
                            (count: number, index: number) => ({
                                userId: factoryInfo.userId,
                                spaceshipType: index,
                                count,
                            })
                        )
                    );
                }

                await tx
                    .delete(builderPads)
                    .where(eq(builderPads.userId, factoryInfo.userId));
                if (factoryInfo.builder_pad_building_timers?.length > 0) {
                    await tx.insert(builderPads).values(
                        factoryInfo.builder_pad_building_timers.map(
                            (timer: string, index: number) => ({
                                userId: factoryInfo.userId,
                                padIndex: index,
                                timer: timer ? new Date(timer) : null,
                                itemBeingBuilt:
                                    factoryInfo.builder_pad_items_being_built[
                                        index
                                    ],
                                secondaryItemIndex:
                                    factoryInfo
                                        .builder_pad_items_being_built_secondary[
                                        index
                                    ],
                            })
                        )
                    );
                }
            });
            return factoryInfo;
        } catch (error) {
            logger.error(
                `[FactoryDAO.createFactory] Error for userId: ${factoryInfo.userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to create factory: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    static async findFactoryByUserId(userId: string) {
        try {
            const res = await db.query.factories.findFirst({
                where: eq(factories.userId, userId),
            });
            if (!res) return null;

            const spaceships = await db
                .select()
                .from(factorySpaceships)
                .where(eq(factorySpaceships.userId, userId))
                .orderBy(factorySpaceships.spaceshipType);
            const pads = await db
                .select()
                .from(builderPads)
                .where(eq(builderPads.userId, userId))
                .orderBy(builderPads.padIndex);

            return {
                userId: res.userId,
                level: res.level,
                factory_upgrade_timer:
                    res.factoryUpgradeTimer?.toISOString() || "",
                builder_pad_building_timers: pads.map(
                    p => p.timer?.toISOString() || ""
                ),
                builder_pad_items_being_built: pads.map(
                    p => p.itemBeingBuilt || ""
                ),
                builder_pad_items_being_built_secondary: pads.map(
                    p => p.secondaryItemIndex ?? -1
                ),
                rockets: res.rockets,
                rocket_type: res.rocketType,
                spaceships: spaceships.map(s => s.count),
                explorers: res.explorers,
                satellites: res.satellites,
                wormhole: res.wormhole,
                astroidDiggers: res.astroidDiggers,
                cyborg: res.cyborg,
                dysonSphere: res.dysonSphere,
            };
        } catch (error) {
            logger.error(
                `[FactoryDAO.findFactoryByUserId] Error for userId: ${userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to fetch factory: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    static async saveFactoryProfile(factoryProfile: any): Promise<any> {
        try {
            await db.transaction(async tx => {
                await tx
                    .insert(factories)
                    .values({
                        userId: factoryProfile.userId,
                        level: factoryProfile.level,
                        factoryUpgradeTimer:
                            factoryProfile.factory_upgrade_timer
                                ? new Date(factoryProfile.factory_upgrade_timer)
                                : null,
                        rockets: factoryProfile.rockets,
                        rocketType: factoryProfile.rocket_type,
                        explorers: factoryProfile.explorers,
                        satellites: factoryProfile.satellites,
                        wormhole: factoryProfile.wormhole,
                        astroidDiggers: factoryProfile.astroidDiggers,
                        cyborg: factoryProfile.cyborg,
                        dysonSphere: factoryProfile.dysonSphere,
                    })
                    .onConflictDoUpdate({
                        target: factories.userId,
                        set: {
                            level: factoryProfile.level,
                            factoryUpgradeTimer:
                                factoryProfile.factory_upgrade_timer
                                    ? new Date(
                                          factoryProfile.factory_upgrade_timer
                                      )
                                    : null,
                            rockets: factoryProfile.rockets,
                            rocketType: factoryProfile.rocket_type,
                            explorers: factoryProfile.explorers,
                            satellites: factoryProfile.satellites,
                            wormhole: factoryProfile.wormhole,
                            astroidDiggers: factoryProfile.astroidDiggers,
                            cyborg: factoryProfile.cyborg,
                            dysonSphere: factoryProfile.dysonSphere,
                        },
                    });

                await tx
                    .delete(factorySpaceships)
                    .where(eq(factorySpaceships.userId, factoryProfile.userId));
                if (factoryProfile.spaceships?.length > 0) {
                    await tx.insert(factorySpaceships).values(
                        factoryProfile.spaceships.map(
                            (count: number, index: number) => ({
                                userId: factoryProfile.userId,
                                spaceshipType: index,
                                count,
                            })
                        )
                    );
                }

                await tx
                    .delete(builderPads)
                    .where(eq(builderPads.userId, factoryProfile.userId));
                if (factoryProfile.builder_pad_building_timers?.length > 0) {
                    await tx.insert(builderPads).values(
                        factoryProfile.builder_pad_building_timers.map(
                            (timer: string, index: number) => ({
                                userId: factoryProfile.userId,
                                padIndex: index,
                                timer: timer ? new Date(timer) : null,
                                itemBeingBuilt:
                                    factoryProfile
                                        .builder_pad_items_being_built[index],
                                secondaryItemIndex:
                                    factoryProfile
                                        .builder_pad_items_being_built_secondary[
                                        index
                                    ],
                            })
                        )
                    );
                }
            });
            return factoryProfile;
        } catch (error) {
            logger.error(
                `[FactoryDAO.saveFactoryProfile] Error for userId: ${factoryProfile.userId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to save factory: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }
}
