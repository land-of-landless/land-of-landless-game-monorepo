import { Schema, InferSchemaType } from "mongoose";
import { billingDBConn } from "@/daos/mongodb/connectDB";

const BillingWalletSchema = new Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        assets: {
            LOL: {
                balance: {
                    type: Number,
                    required: true,
                    default: 0,
                    min: 0,
                },
            },
        },

        connectedSolanaWallet: {
            type: String,
        },

        transactions: [
            {
                type: Schema.Types.ObjectId,
                ref: "BillingTransaction",
            },
        ],

        updateVersion: {
            type: Number,
            required: true,
            default: 1,
        },
    },
    {
        timestamps: true,
    },
);

export type BillingWalletType = InferSchemaType<typeof BillingWalletSchema>;

const BillingWalletModel = billingDBConn.model<BillingWalletType>(
    "BillingWallet",
    BillingWalletSchema,
);

export default BillingWalletModel;
