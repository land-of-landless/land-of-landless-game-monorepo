import { Schema, Entity } from "redis-om";
// import { } from "@/constants/lab";

export interface Lab extends Entity {
    userId: string;
    level: number;
    lab_upgrade_timer: string;
    factoryTech: number;
    energyGeneratorTech: number;
    rocketTech: number;
    miningTech: number;
    portalTech: number;
    generalTech: number;
}

export const labSchema = new Schema<Lab>("lab", {
    userId: {
        type: "string",
        indexed: true,
    },
});

export default labSchema;
