import { Schema, InferSchemaType } from "mongoose";
import { authDBConn } from "@/daos/mongodb/connectDB";

const AccountSchema = new Schema(
    {
        provider: {
            type: String,
            enum: ["discord", "google", "x"],
            required: true,
        },
        type: {
            type: String,
            enum: ["oauth2.0", "oauth1.0a"],
            required: true,
        },
        providerAccountId: {
            type: String,
            required: true,
        },
        access_token: {
            type: String,
            required: true,
        },
        refresh_token: {
            type: String,
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    },
    {
        timestamps: true,
    },
);

export type AccountType = InferSchemaType<typeof AccountSchema>;

const AccountModel = authDBConn.model<AccountType>("Account", AccountSchema);
export default AccountModel;
