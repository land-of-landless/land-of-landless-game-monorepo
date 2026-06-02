import { eq } from "drizzle-orm";
import { db } from "./connection.js";
import { energyGenerators } from "../../models/postgres/schema.js";

export class EnergyGeneratorDAO {
    static async saveEnergyGeneratorProfile(data: any) {
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
    }

    static async createEnergyGenerator(data: any) {
        return this.saveEnergyGeneratorProfile(data);
    }

    static async findEnergyGeneratorByUserId(userId: string) {
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
