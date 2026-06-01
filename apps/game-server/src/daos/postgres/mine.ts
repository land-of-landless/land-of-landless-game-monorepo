import { eq } from "drizzle-orm";
import { db } from "./connection.js";
import { mines, miners } from "../../models/postgres/schema.js";

export class MineDAO {
    static async saveMineProfile(data: any) {
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
            const minersList: any[] = [];
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

    static async createMine(data: any) {
        return this.saveMineProfile(data);
    }

    static async findMineByUserId(userId: string) {
        const res = await db.query.mines.findFirst({ where: eq(mines.userId, userId) });
        if (!res) return null;
        const minerRows = await db.select().from(miners).where(eq(miners.userId, userId));
        const minersInfo: any = {
            miner1: { level: 0 },
            miner2: { level: 0 },
            miner3: { level: 0 }
        };
        minerRows.forEach(m => {
            if (m.minerId >= 1 && m.minerId <= 3) {
                minersInfo[`miner${m.minerId}`] = { level: m.level };
            }
        });
        return {
            userId: res.userId,
            being_upgraded_miner_id: res.beingUpgradedMinerId,
            upgrade_timer: res.upgradeTimer?.toISOString() || "",
            miners_info: minersInfo
        };
    }
}
