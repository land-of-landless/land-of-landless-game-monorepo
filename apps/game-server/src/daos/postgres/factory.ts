import { eq } from "drizzle-orm";
import { db } from "./connection.js";
import { factories, factorySpaceships, builderPads } from "../../models/postgres/schema.js";

export class FactoryDAO {
    static async saveFactoryProfile(data: any) {
        return await db.transaction(async (tx) => {
            await tx.insert(factories).values({
                userId: data.userId,
                level: data.level,
                factoryUpgradeTimer: data.factory_upgrade_timer ? new Date(data.factory_upgrade_timer) : null,
                rockets: data.rockets,
                rocketType: data.rocket_type,
                explorers: data.explorers,
                satellites: data.satellites,
                wormhole: data.wormhole,
                astroidDiggers: data.astroidDiggers,
                cyborg: data.cyborg,
                dysonSphere: data.dysonSphere,
            }).onConflictDoUpdate({
                target: factories.userId,
                set: {
                    level: data.level,
                    factoryUpgradeTimer: data.factory_upgrade_timer ? new Date(data.factory_upgrade_timer) : null,
                    rockets: data.rockets,
                    rocketType: data.rocket_type,
                    explorers: data.explorers,
                    satellites: data.satellites,
                    wormhole: data.wormhole,
                    astroidDiggers: data.astroidDiggers,
                    cyborg: data.cyborg,
                    dysonSphere: data.dysonSphere,
                }
            });

            await tx.delete(factorySpaceships).where(eq(factorySpaceships.userId, data.userId));
            if (data.spaceships?.length > 0) {
                await tx.insert(factorySpaceships).values(data.spaceships.map((count: number, index: number) => ({
                    userId: data.userId,
                    spaceshipType: index,
                    count
                })));
            }

            await tx.delete(builderPads).where(eq(builderPads.userId, data.userId));
            if (data.builder_pad_building_timers?.length > 0) {
                await tx.insert(builderPads).values(data.builder_pad_building_timers.map((timer: string, index: number) => ({
                    userId: data.userId,
                    padIndex: index,
                    timer: timer ? new Date(timer) : null,
                    itemBeingBuilt: data.builder_pad_items_being_built[index],
                    secondaryItemIndex: data.builder_pad_items_being_built_secondary[index]
                })));
            }
        });
    }

    static async createFactory(data: any) {
        return this.saveFactoryProfile(data);
    }

    static async findFactoryByUserId(userId: string) {
        const res = await db.query.factories.findFirst({
            where: eq(factories.userId, userId)
        });
        if (!res) return null;

        const spaceships = await db.select().from(factorySpaceships).where(eq(factorySpaceships.userId, userId)).orderBy(factorySpaceships.spaceshipType);
        const pads = await db.select().from(builderPads).where(eq(builderPads.userId, userId)).orderBy(builderPads.padIndex);

        return {
            userId: res.userId,
            level: res.level,
            factory_upgrade_timer: res.factoryUpgradeTimer?.toISOString() || "",
            builder_pad_building_timers: pads.map(p => p.timer?.toISOString() || ""),
            builder_pad_items_being_built: pads.map(p => p.itemBeingBuilt || ""),
            builder_pad_items_being_built_secondary: pads.map(p => p.secondaryItemIndex ?? -1),
            rockets: res.rockets,
            rocket_type: res.rocketType,
            spaceships: spaceships.map(s => s.count),
            explorers: res.explorers,
            satellites: res.satellites,
            wormhole: res.wormhole,
            astroidDiggers: res.astroidDiggers,
            cyborg: res.cyborg,
            dysonSphere: res.dysonSphere
        };
    }
}
