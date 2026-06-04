import { EnergyGeneratorLevelsType } from "@/constants/energyGenerator";
import { Schema, Entity } from "redis-om";

export interface EnergyGenerator extends Entity {
    userId: string;
    panel_count: number;
    level: 0 | EnergyGeneratorLevelsType;
    upgrade_timer: string;
}

export const energyGeneratorSchema = new Schema<EnergyGenerator>(
    "energyGenerator",
    {
        userId: {
            type: "string",
            indexed: true,
        },
    },
);

export default energyGeneratorSchema;
