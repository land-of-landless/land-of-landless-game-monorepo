import { MineMinerId, MineUpgradeLevel } from "@/constants/index.js";
import { Schema, Entity } from "redis-om";

// levels : 1 to 3
// max 3 mines
// each mine gets upgraded separately
// each upgrade doubles generation rate

export interface Mine extends Entity {
    userId: string;
    miners_info: {
        miner1: {
            level: MineUpgradeLevel | 0; // 0 means not built yet
        };
        miner2: {
            level: MineUpgradeLevel | 0; // 0 means not built yet
        };
        miner3: {
            level: MineUpgradeLevel | 0; // 0 means not built yet
        };
    };
    being_upgraded_miner_id: MineMinerId | -1; // -1 for not having one being upgraded or null
    upgrade_timer: string;
}

export const mineSchema = new Schema<Mine>("mine", {
    userId: {
        type: "string",
        indexed: true,
    },
});

export default mineSchema;
