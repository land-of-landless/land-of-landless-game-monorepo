import { db } from "./connection.js";
import {
    billings,
    invoices,
    energyGenerators,
    factories,
    factorySpaceships,
    builderPads,
    identities,
    identityIps,
    labs,
    launchSites,
    satelliteTimers,
    dysonSphereTimers,
    mines,
    miners,
    miniGames,
    mg2RemainingNumbers,
    mg3BoxesState,
    stats,
    lootBoxesByType,
    launchesByItem,
} from "../../models/postgres/schema.js";
import { eq, and } from "drizzle-orm";

export class BillingPostgresDAO {
    static async createBilling(billingData: any) {
        return await db.transaction(async (tx) => {
            await tx.insert(billings).values({ userId: billingData.userId });
            if (billingData.finishedInvoices?.length > 0) {
                await tx.insert(invoices).values(
                    billingData.finishedInvoices.map((id: string) => ({
                        id,
                        userId: billingData.userId,
                        status: "finished",
                    })),
                );
            }
            if (billingData.ongoingInvoices?.length > 0) {
                await tx.insert(invoices).values(
                    billingData.ongoingInvoices.map((id: string) => ({
                        id,
                        userId: billingData.userId,
                        status: "ongoing",
                    })),
                );
            }
            return billingData;
        });
    }

    static async findByUserId(userId: string) {
        const result = await db.query.billings.findFirst({
            where: eq(billings.userId, userId),
        });
        if (!result) return null;

        const invs = await db.select().from(invoices).where(eq(invoices.userId, userId));
        return {
            userId: result.userId,
            finishedInvoices: invs.filter(i => i.status === "finished").map(i => i.id),
            ongoingInvoices: invs.filter(i => i.status === "ongoing").map(i => i.id),
        };
    }
}

export class EnergyGeneratorPostgresDAO {
    static async save(data: any) {
        await db.insert(energyGenerators).values({
            userId: data.userId,
            panelCount: data.panel_count,
            level: data.level,
            upgradeTimer: data.upgrade_timer ? new Date(data.upgrade_timer) : null,
        }).onConflictDoUpdate({
            target: energyGenerators.userId,
            set: {
                panelCount: data.panel_count,
                level: data.level,
                upgradeTimer: data.upgrade_timer ? new Date(data.upgrade_timer) : null,
            }
        });
        return data;
    }

    static async findByUserId(userId: string) {
        const res = await db.query.energyGenerators.findFirst({
            where: eq(energyGenerators.userId, userId)
        });
        if (!res) return null;
        return {
            userId: res.userId,
            panel_count: res.panelCount,
            level: res.level,
            upgrade_timer: res.upgradeTimer?.toISOString() || "",
        };
    }
}

export class FactoryPostgresDAO {
    static async save(data: any) {
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
                    itemBeingBuilt: data.builder_pad_items_being_built?.[index],
                    secondaryItemIndex: data.builder_pad_items_being_built_secondary?.[index]
                })));
            }
        });
    }

    static async findByUserId(userId: string) {
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

export class LabPostgresDAO {
    static async save(data: any) {
        await db.insert(labs).values({
            userId: data.userId,
            level: data.level,
            labUpgradeTimer: data.lab_upgrade_timer ? new Date(data.lab_upgrade_timer) : null,
            factoryTech: data.factoryTech,
            energyGeneratorTech: data.energyGeneratorTech,
            rocketTech: data.rocketTech,
            miningTech: data.miningTech,
            portalTech: data.portalTech,
            generalTech: data.generalTech
        }).onConflictDoUpdate({
            target: labs.userId,
            set: {
                level: data.level,
                labUpgradeTimer: data.lab_upgrade_timer ? new Date(data.lab_upgrade_timer) : null,
                factoryTech: data.factoryTech,
                energyGeneratorTech: data.energyGeneratorTech,
                rocketTech: data.rocketTech,
                miningTech: data.miningTech,
                portalTech: data.portalTech,
                generalTech: data.generalTech
            }
        });
    }

    static async findByUserId(userId: string) {
        const res = await db.query.labs.findFirst({ where: eq(labs.userId, userId) });
        if (!res) return null;
        return {
            userId: res.userId,
            level: res.level,
            lab_upgrade_timer: res.labUpgradeTimer?.toISOString() || "",
            factoryTech: res.factoryTech,
            energyGeneratorTech: res.energyGeneratorTech,
            rocketTech: res.rocketTech,
            miningTech: res.miningTech,
            portalTech: res.portalTech,
            generalTech: res.generalTech
        };
    }
}

export class MinePostgresDAO {
    static async save(data: any) {
        return await db.transaction(async (tx) => {
            await tx.insert(mines).values({
                userId: data.userId,
                beingUpgradedMinerId: data.being_upgraded_miner_id,
                upgradeTimer: data.upgrade_timer ? new Date(data.upgrade_timer) : null
            }).onConflictDoUpdate({
                target: mines.userId,
                set: {
                    beingUpgradedMinerId: data.being_upgraded_miner_id,
                    upgradeTimer: data.upgrade_timer ? new Date(data.upgrade_timer) : null
                }
            });

            await tx.delete(miners).where(eq(miners.userId, data.userId));
            const minersList = [];
            if (data.miners_info) {
                if (data.miners_info.miner1) minersList.push({ userId: data.userId, minerId: 1, level: data.miners_info.miner1.level });
                if (data.miners_info.miner2) minersList.push({ userId: data.userId, minerId: 2, level: data.miners_info.miner2.level });
                if (data.miners_info.miner3) minersList.push({ userId: data.userId, minerId: 3, level: data.miners_info.miner3.level });
            }
            if (minersList.length > 0) {
                await tx.insert(miners).values(minersList);
            }
        });
    }

    static async findByUserId(userId: string) {
        const res = await db.query.mines.findFirst({ where: eq(mines.userId, userId) });
        if (!res) return null;
        const minerRows = await db.select().from(miners).where(eq(miners.userId, userId));
        const minersInfo: any = {};
        minerRows.forEach(m => {
            minersInfo[`miner${m.minerId}`] = { level: m.level };
        });
        return {
            userId: res.userId,
            being_upgraded_miner_id: res.beingUpgradedMinerId,
            upgrade_timer: res.upgradeTimer?.toISOString() || "",
            miners_info: minersInfo
        };
    }
}

export class StatsPostgresDAO {
    static async save(data: any) {
        return await db.transaction(async (tx) => {
            await tx.insert(stats).values({
                userId: data.userId,
                lootBoxesOpenedTotal: data.loot_boxes_opened_total,
                launchesTotal: data.launches_total
            }).onConflictDoUpdate({
                target: stats.userId,
                set: {
                    lootBoxesOpenedTotal: data.loot_boxes_opened_total,
                    launchesTotal: data.launches_total
                }
            });

            await tx.delete(lootBoxesByType).where(eq(lootBoxesByType.userId, data.userId));
            if (data.loot_boxes_opened_by_type) {
                const types = Object.entries(data.loot_boxes_opened_by_type);
                if (types.length > 0) {
                    await tx.insert(lootBoxesByType).values(types.map(([boxType, count]) => ({
                        userId: data.userId,
                        boxType,
                        count: count as number
                    })));
                }
            }

            await tx.delete(launchesByItem).where(eq(launchesByItem.userId, data.userId));
            if (data.launches_by_item) {
                const items = Object.entries(data.launches_by_item);
                if (items.length > 0) {
                    await tx.insert(launchesByItem).values(items.map(([itemType, count]) => ({
                        userId: data.userId,
                        itemType,
                        count: count as number
                    })));
                }
            }
        });
    }

    static async findByUserId(userId: string) {
        const res = await db.query.stats.findFirst({ where: eq(stats.userId, userId) });
        if (!res) return null;
        const types = await db.select().from(lootBoxesByType).where(eq(lootBoxesByType.userId, userId));
        const items = await db.select().from(launchesByItem).where(eq(launchesByItem.userId, userId));

        return {
            userId: res.userId,
            loot_boxes_opened_total: res.lootBoxesOpenedTotal,
            launches_total: res.launchesTotal,
            loot_boxes_opened_by_type: Object.fromEntries(types.map(t => [t.boxType, t.count])),
            launches_by_item: Object.fromEntries(items.map(i => [i.itemType, i.count]))
        };
    }
}
