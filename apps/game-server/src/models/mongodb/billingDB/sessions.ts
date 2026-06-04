import { Schema, InferSchemaType, model } from "mongoose";
import { authDBConn, billingDBConn } from "@/daos/mongodb/connectDB";

const BillingSessionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        walletId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "BillingWallet",
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        type: {
            type: String,
            required: true,
            enum: ["DEPOSIT", "WITHDRAWAL"],
        },
        assetName: {
            type: String,
            required: true,
            enum: ["LOL", "USDC", "DOGE"],
        },
        assetAddress: {
            type: String,
            required: true,
            enum: [
                "HVi7VWWzbYxb8YfKtuyepxkQkmQ2rPCnLuzAigDtkK8C",
                "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                "DOGE",
            ],
        },
        // solana pay
        reference: {
            type: String, // a public key
            required: true,
        },
        // general reference to TX
        txId: {
            type: String,
        },
        status: {
            type: String,
            required: true,
            enum: ["PENDING", "VALIDATING", "SUCCESSFUL", "FAILED"],
        },
        message: {
            type: String,
        },
        memo: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

export type BillingSessionType = InferSchemaType<typeof BillingSessionSchema>;

const BillingSessionModel = billingDBConn.model<BillingSessionType>(
    "BillingSession",
    BillingSessionSchema,
);
export default BillingSessionModel;
