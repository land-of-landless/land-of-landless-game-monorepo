import { eq } from "drizzle-orm";
import { db } from "./connection.js";
import { stats, lootBoxesByType, launchesByItem } from "../../models/postgres/schema.js";

export class StatsDAO {
    static async saveStatsProfile(data: any) {
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

    static async createStats(data: any) {
        return this.saveStatsProfile(data);
    }

    static async findStatsByUserId(userId: string) {
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
