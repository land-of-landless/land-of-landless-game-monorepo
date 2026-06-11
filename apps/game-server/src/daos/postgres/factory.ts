import { db } from "./connection.js";
import {
    factories,
    factorySpaceships,
    builderPads,
} from "@/models/postgres/schema.js";
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
                        user_id: factoryInfo.userId,
                        level: factoryInfo.level,
                        factory_upgrade_timer: factoryInfo.factory_upgrade_timer
                            ? new Date(factoryInfo.factory_upgrade_timer)
                            : null,
                        rockets: factoryInfo.rockets,
                        rocket_type: factoryInfo.rocket_type,
                        explorers: factoryInfo.explorers,
                        satellites: factoryInfo.satellites,
                        wormhole: factoryInfo.wormhole,
                        astroid_diggers: factoryInfo.astroidDiggers,
                        cyborg: factoryInfo.cyborg,
                        dyson_sphere: factoryInfo.dysonSphere,
                    })
                    .onConflictDoUpdate({
                        target: factories.user_id,
                        set: {
                            level: factoryInfo.level,
                            factory_upgrade_timer:
                                factoryInfo.factory_upgrade_timer
                                    ? new Date(
                                          factoryInfo.factory_upgrade_timer
                                      )
                                    : null,
                            rockets: factoryInfo.rockets,
                            rocket_type: factoryInfo.rocket_type,
                            explorers: factoryInfo.explorers,
                            satellites: factoryInfo.satellites,
                            wormhole: factoryInfo.wormhole,
                            astroid_diggers: factoryInfo.astroidDiggers,
                            cyborg: factoryInfo.cyborg,
                            dyson_sphere: factoryInfo.dysonSphere,
                        },
                    });

                await tx
                    .delete(factorySpaceships)
                    .where(eq(factorySpaceships.user_id, factoryInfo.userId));
                if (factoryInfo.spaceships?.length > 0) {
                    await tx.insert(factorySpaceships).values(
                        factoryInfo.spaceships.map(
                            (count: number, index: number) => ({
                                user_id: factoryInfo.userId,
                                spaceship_type: index,
                                count,
                            })
                        )
                    );
                }

                await tx
                    .delete(builderPads)
                    .where(eq(builderPads.user_id, factoryInfo.userId));
                if (factoryInfo.builder_pad_building_timers?.length > 0) {
                    await tx.insert(builderPads).values(
                        factoryInfo.builder_pad_building_timers.map(
                            (timer: string, index: number) => ({
                                user_id: factoryInfo.userId,
                                pad_index: index,
                                timer: timer ? new Date(timer) : null,
                                item_being_built:
                                    factoryInfo.builder_pad_items_being_built[
                                        index
                                    ],
                                secondary_item_index:
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
                where: eq(factories.user_id, userId),
            });
            if (!res) return null;

            const spaceships = await db
                .select()
                .from(factorySpaceships)
                .where(eq(factorySpaceships.user_id, userId))
                .orderBy(factorySpaceships.spaceship_type);
            const pads = await db
                .select()
                .from(builderPads)
                .where(eq(builderPads.user_id, userId))
                .orderBy(builderPads.pad_index);

            return {
                userId: res.user_id,
                level: res.level,
                factory_upgrade_timer:
                    res.factory_upgrade_timer?.toISOString() || "",
                builder_pad_building_timers: pads.map(
                    p => p.timer?.toISOString() || ""
                ),
                builder_pad_items_being_built: pads.map(
                    p => p.item_being_built || ""
                ),
                builder_pad_items_being_built_secondary: pads.map(
                    p => p.secondary_item_index ?? -1
                ),
                rockets: res.rockets,
                rocket_type: res.rocket_type,
                spaceships: spaceships.map(s => s.count),
                explorers: res.explorers,
                satellites: res.satellites,
                wormhole: res.wormhole,
                astroidDiggers: res.astroid_diggers,
                cyborg: res.cyborg,
                dysonSphere: res.dyson_sphere,
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
                        user_id: factoryProfile.userId,
                        level: factoryProfile.level,
                        factory_upgrade_timer:
                            factoryProfile.factory_upgrade_timer
                                ? new Date(factoryProfile.factory_upgrade_timer)
                                : null,
                        rockets: factoryProfile.rockets,
                        rocket_type: factoryProfile.rocket_type,
                        explorers: factoryProfile.explorers,
                        satellites: factoryProfile.satellites,
                        wormhole: factoryProfile.wormhole,
                        astroid_diggers: factoryProfile.astroidDiggers,
                        cyborg: factoryProfile.cyborg,
                        dyson_sphere: factoryProfile.dysonSphere,
                    })
                    .onConflictDoUpdate({
                        target: factories.user_id,
                        set: {
                            level: factoryProfile.level,
                            factory_upgrade_timer:
                                factoryProfile.factory_upgrade_timer
                                    ? new Date(
                                          factoryProfile.factory_upgrade_timer
                                      )
                                    : null,
                            rockets: factoryProfile.rockets,
                            rocket_type: factoryProfile.rocket_type,
                            explorers: factoryProfile.explorers,
                            satellites: factoryProfile.satellites,
                            wormhole: factoryProfile.wormhole,
                            astroid_diggers: factoryProfile.astroidDiggers,
                            cyborg: factoryProfile.cyborg,
                            dyson_sphere: factoryProfile.dysonSphere,
                        },
                    });

                await tx
                    .delete(factorySpaceships)
                    .where(
                        eq(factorySpaceships.user_id, factoryProfile.userId)
                    );
                if (factoryProfile.spaceships?.length > 0) {
                    await tx.insert(factorySpaceships).values(
                        factoryProfile.spaceships.map(
                            (count: number, index: number) => ({
                                user_id: factoryProfile.userId,
                                spaceship_type: index,
                                count,
                            })
                        )
                    );
                }

                await tx
                    .delete(builderPads)
                    .where(eq(builderPads.user_id, factoryProfile.userId));
                if (factoryProfile.builder_pad_building_timers?.length > 0) {
                    await tx.insert(builderPads).values(
                        factoryProfile.builder_pad_building_timers.map(
                            (timer: string, index: number) => ({
                                user_id: factoryProfile.userId,
                                pad_index: index,
                                timer: timer ? new Date(timer) : null,
                                item_being_built:
                                    factoryProfile
                                        .builder_pad_items_being_built[index],
                                secondary_item_index:
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
