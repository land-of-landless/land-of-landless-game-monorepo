import { eq } from "drizzle-orm";
import { db } from "./connection.js";
import { labs } from "../../models/postgres/schema.js";

export class LabDAO {
    static async saveLabProfile(data: any) {
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

    static async createLab(data: any) {
        return this.saveLabProfile(data);
    }

    static async findLabByUserId(userId: string) {
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
