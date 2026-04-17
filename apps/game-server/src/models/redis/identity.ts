import { Schema, Entity } from "redis-om";

export interface Identity extends Entity {
    ips: string[];
    ips_count: number[];
    userId: string;
}

const IdentitySchema = new Schema<Identity>("identity", {
    userId: {
        type: "string",
        indexed: true,
    },
});

export default IdentitySchema;
