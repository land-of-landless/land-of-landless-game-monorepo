import { Schema, Entity } from "redis-om";

export interface Billing extends Entity {
    userId: string;
    finishedInvoices: string[];
    ongoingInvoices: string[];
}

const billingSchema = new Schema<Billing>("billing", {
    userId: {
        type: "string",
        indexed: true,
    },
});

export default billingSchema;
